import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Http from '../../components/console/http-verb';
import Toast from '../../components/toast';
import '../../lib/webauthn.js';

export default class ConsoleConfigureComponent extends React.Component{
  constructor(){
    super();
    this.state = { password: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(){
    Http.post('/api/credentials/update', {password: this.state.password},
      () => Toast.show('Credential update successful', 'success'),
      () => Toast.show('Credential update failed', 'warning')
    );
    return false;
  }

  getValidationState(){
    if(!this.state.password) return null;
    return this.isValidPassword() ? 'success' : 'error'
  }

  handleChange(e){
    this.setState({password: e.target.value});
  }

  isValidPassword(){
    return this.state.password.length >= 8;
  }

  registerCredential(){
    const p = this.context.profile;
    const account = { rpDisplayName: p.username, userDisplayName: p.username, imageUri: p.avater };
    const cryptoParams = [{ type: 'FIDO_2_0', algorithm: 'RSASSA-PKCS1-v1_5' }];
    navigator.authentication.makeCredential(account, cryptoParams)
    .then(result => {
      const key = JSON.stringify(result.publicKey);
      const id = result.credential.id;
      Http.post('/api/fido/register', {key, id},
        () => Toast.show('FIDO key registered', 'success'),
        () => Toast.show('failed', 'warning')
      );
      console.log(result);
    });
  }

  render(){
    return(
      <div>
        <h2>Configure credentials</h2>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <ControlLabel>Git Username</ControlLabel>
            <FormControl disabled={true} value={this.context.profile.username}/>
          </FormGroup>
          <FormGroup validationState={this.getValidationState()}>
            <ControlLabel>Git Password</ControlLabel>
            <FormControl type='password' onChange={this.handleChange.bind(this)}/>
            <FormControl.Feedback />
          </FormGroup>
          <Button bsStyle='primary' type='submit' disabled={!this.isValidPassword()}>update</Button>
        </form>
        <h2>Register FIDO 2.0 credential</h2>
        <p>currently only works on Microsoft Edge</p>
        <Button bsStyle='primary' onClick={this.registerCredential.bind(this)}>register</Button>
      </div>
    );
  }
}
ConsoleConfigureComponent.contextTypes = {
  profile: React.PropTypes.object
}
