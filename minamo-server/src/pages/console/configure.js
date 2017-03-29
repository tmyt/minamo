import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel, Row, Col } from 'react-bootstrap';
import Dropzone from 'react-dropzone-component';
import SocialConnect from '../../components/console/social-connect';
import Http from '../../components/console/http-verb';
import Toast from '../../components/toast';
import EdgeButton from '../../components/edge-button';
import '../../lib/webauthn.js';

export default class ConsoleConfigureComponent extends React.Component{
  render(){
    return(
      <div>
        <h2>Configure profile</h2>
        <h3>minamo id</h3>
        <MinamoIdForm />
        <h3>Connect social account</h3>
        <SocialConnect />
        <h3>Register FIDO 2.0 credential</h3>
        <Fido2Form />
      </div>
    );
  }
}
ConsoleConfigureComponent.contextTypes = {
  profile: React.PropTypes.object
}

// Form Component for minamo id
class MinamoIdForm extends React.Component{
  constructor(){
    super();
    this.state = { password: '', avatar: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e){
    this.setState({password: e.target.value});
  }
  handleSubmit(e){
    Http.post('/api/users/profile/update', {password: this.state.password, avatar: this.state.avatar},
      () => {
        Toast.show('Profile update successful', 'success');
        this.setState({password: '', avatar: ''});
      },
      () => Toast.show('Profile update failed', 'warning')
    );
    e.preventDefault();
    return false;
  }
  getValidationState(){
    if(!this.state.password) return null;
    return this.isValidPassword() ? 'success' : 'error'
  }
  isValidPassword(){
    return this.state.password.length >= 8;
  }
  isValidFormData(){
    if(!this.state.password && this.state.avatar) return true;
    return this.isValidPassword();
  }
  render(){
    const componentConfig = {postUrl: '/api/users/avatar/upload'}
    const djsConfig = {maxFiles: 1, dictDefaultMessage: '<span class="fa fa-upload fa-3x"></i>'};
    const eventHandlers = {
      addedfile: function(){
        if(this.files[1]) { this.removeFile(this.files[0]); }
      },
      success: (e, res) => {
        this.setState({avatar: res});
      }
    }
    return(
      <form onSubmit={this.handleSubmit}>
        <Row>
          <Col sm={8}>
            <FormGroup>
              <ControlLabel>Username</ControlLabel>
              <FormControl disabled={true} value={this.context.profile.username}/>
            </FormGroup>
            <FormGroup validationState={this.getValidationState()}>
              <ControlLabel>Password</ControlLabel>
              <FormControl type='password' onChange={this.handleChange} value={this.state.password}/>
              <FormControl.Feedback />
            </FormGroup>
          </Col>
          <Col sm={4}>
            <FormGroup>
              <ControlLabel>Image</ControlLabel>
              <div>
                <Dropzone config={componentConfig} eventHandlers={eventHandlers} djsConfig={djsConfig}/>
              </div>
            </FormGroup>
          </Col>
        </Row>
        <Button bsStyle='primary' type='submit' disabled={!this.isValidFormData()}>update</Button>
      </form>
    );
  }
}
MinamoIdForm.contextTypes = {
  profile: React.PropTypes.object
}

// Form Component for FIDO2 Credential
class Fido2Form extends React.Component{
  registerCredential(){
    const p = this.context.profile;
    const account = { rpDisplayName: p.username, displayName: p.username, imageUri: p.avater };
    const cryptoParams = [{ type: 'FIDO_2_0', algorithm: 'RSASSA-PKCS1-v1_5' }];
    navigator.authentication.makeCredential(account, cryptoParams)
    .then(result => {
      const key = JSON.stringify(result.publicKey);
      const id = result.credential.id;
      Http.post('/api/credentials/fido/register', {key, id},
        () => Toast.show('FIDO key registered', 'success'),
        () => Toast.show('Key registration failed', 'warning')
      );
      console.log(result);
    });
  }
  resetCredential(){
    window.indexedDB.deleteDatabase('_webauthn');
  }
  render(){
    return(
      <form>
        <EdgeButton bsStyle='primary' onClick={this.registerCredential.bind(this)}>register</EdgeButton>
        <EdgeButton style={{marginLeft: '8px'}} bsStyle='danger' onClick={this.resetCredential}>reset</EdgeButton>
      </form>
    );
  }
}
Fido2Form.contextTypes = {
  profile: React.PropTypes.object
}
