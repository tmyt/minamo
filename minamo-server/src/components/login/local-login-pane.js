import React from 'react';
import { Col, Button, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
import { withRouter } from 'react-router';
import qs from '../../lib/querystring';
import Base64 from '../../lib/base64';

import FontAwesome from '../font-awesome';

const Visibility = ({isVisible, children}) => (
  <div style={{ display: isVisible ? 'block' : 'none' }}>
    {children}
  </div>
);

class LocalLoginPane extends React.Component{
  constructor(){
    super();
    this.state = { phase: 0, username: '' };
    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  tryPublicKeyLogin(){
    if(typeof navigator !== 'object' || typeof navigator.credentials !== 'object'){
      return Promise.reject('Your browser has no WebAuthn support');
    }
    // fetch WebAuthn initial message
    const params = new URLSearchParams();
    params.set('username', this.state.username);
    return fetch('/auth/fido2/get?' + params.toString())
      .then(result => result.json())
      .then(options => {
        options.challenge = new Uint8Array(options.challenge).buffer;
        options.allowCredentials.forEach(c => {
          c.id = new Uint8Array([].map.call(Base64.decode(c.id), c => c.charCodeAt(0)));
        });
        return navigator.credentials.get({ publicKey: options });
      })
      .then(x => {
        const obj = {
          id: x.id,
          rawId: Array.from(new Uint8Array(x.rawId)),
          response: {
            authenticatorData: Array.from(new Uint8Array(x.response.authenticatorData)),
            clientDataJSON: Array.from(new Uint8Array(x.response.clientDataJSON)),
            signature: Array.from(new Uint8Array(x.response.signature)),
            userHandle: Array.from(new Uint8Array(x.response.userHandle)),
          },
        };
        // put args
        this.fido2form.id.value = this.state.username;
        this.fido2form.result.value = JSON.stringify(obj);
        this.fido2form.submit();
        this.fido2form.id.value = '';
        this.fido2form.result.value = '';
      })
      .catch(() => false)
      .then(() => false);
  }

  handleChange(field){
    return (e) => {
      this.setState({[field]: e.target.value});
    };
  }

  onSubmit(e){
    if(this.state.phase == 0){
      e.preventDefault();
      if(!this.state.username){
        this.setState({ validation: 'error' });
        return;
      }
      this.tryPublicKeyLogin()
        .then(success => {
          if(!success){
            this.setState({ phase: 1 });
          }
        })
        .catch(() => {
          this.setState({ phase: 1 });
        });
    }
  }

  render(){
    const args = qs.export(this.props.location, ['_redir']);
    return (
      <Col sm={6}>
        <h4 className='header'>minamo id</h4>
        <form method='post' action={`/auth/local${args}`} onSubmit={this.onSubmit}>
          <FormGroup className='vertical-grouped' validationState={this.state.validation}>
            <Visibility isVisible={ this.state.phase == 0 }>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text><FontAwesome icon='user' /></InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl name='username' placeholder='Username' autoFocus={true}
                             value={this.state.username} onChange={this.handleChange('username')} />
              </InputGroup>
            </Visibility>
            <Visibility isVisible={ this.state.phase == 1 }>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text><FontAwesome icon='key' /></InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl name='password' placeholder='Password' type='password' autoFocus={true} />
              </InputGroup>
            </Visibility>
          </FormGroup>
          <FormGroup>
            <Button variant='primary' type='submit' block>Sign In</Button>
          </FormGroup>
        </form>
        <form method='post' action={`/auth/fido2${args}`} ref={(ref) => { this.fido2form = ref; }}>
          <input name='id' type='hidden' />
          <input name='result' type='hidden' />
        </form>
      </Col>
    );
  }
}

export default withRouter(LocalLoginPane);
