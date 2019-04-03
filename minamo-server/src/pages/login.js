import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Panel, Row, Col, Button, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
import qs from '../lib/querystring';
import Base64 from '../lib/base64';

import Http from '../components/console/http-verb';
import FontAwesome from '../components/font-awesome';
import PageRoot from '../components/page-root';
import Fido2LoginButton from '../components/fido2-login';

class Visibility extends React.Component{
  render(){
    return this.props.isVisible ? this.props.children : null;
  }
}

class SocialLoginPane extends React.Component{
  render(){
    const args = qs.export(this.context.router, ['_redir']);
    return (
      <Col sm={6}>
        <h4 className='header'>social account</h4>
        <Button bsStyle='primary' href={`/auth/github${args}`} block>
          <FontAwesome icon='github' />
          <span>Login with GitHub</span>
        </Button>
      </Col>
    );
  }
}
SocialLoginPane.contextTypes = {
  router: PropTypes.object
};

class LocalLoginPane extends React.Component{
  constructor(){
    super();
    this.state = { phase: 0 };
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
        c.id = new Uint8Array([].map.call(Base64.decode(c.id), c => c.charCodeAt(0)))
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
console.log(this.fido2form);
      this.fido2form.id.value = this.state.username;
      this.fido2form.result.value = JSON.stringify(obj);
      this.fido2form.submit();
      this.fido2form.id.value = ''
      this.fido2form.result.value = '';
      //Http.post('/auth/fido2/login', { result: JSON.stringify(obj) });
      console.log(x)
    })
    .then(x => false)
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
      .catch(e => {
        this.setState({ phase: 1 });
      })
    }else{
    }
  }

  render(){
    const args = qs.export(this.context.router, ['_redir']);
    return (
      <Col sm={6}>
        <h4 className='header'>minamo id</h4>
        <form method='post' action={`/auth/local${args}`} onSubmit={this.onSubmit}>
          <input name='username' type='hidden' value={this.state.username} />
          <FormGroup className='vertical-grouped'>
            <Visibility isVisible={ this.state.phase == 0 }>
              <InputGroup validationState={this.state.validation}>
                <InputGroup.Addon>
                  <FontAwesome icon='user' />
                </InputGroup.Addon>
                <FormControl name='username' placeholder='Username' autoFocus={true}
                             value={this.state.username} onChange={this.handleChange('username')} />
              </InputGroup>
            </Visibility>
            <Visibility isVisible={ this.state.phase == 1 }>
              <InputGroup>
                <InputGroup.Addon>
                  <FontAwesome icon='key' />
                </InputGroup.Addon>
                <FormControl name='password' placeholder='Password' type='password' autoFocus={true} />
              </InputGroup>
            </Visibility>
          </FormGroup>
          <FormGroup>
            <Button bsStyle='primary' type='submit' block>Sign In</Button>
          </FormGroup>
        </form>
        <form method='post' action={`/auth/fido2${args}`} ref={(ref) => { this.fido2form = ref }}>
          <input name='id' type='hidden' />
          <input name='result' type='hidden' />
        </form>
      </Col>
    );
  }
}
LocalLoginPane.contextTypes = {
  router: PropTypes.object
};

export default class LoginComponent extends React.Component{
  render(){
    const title = (<h3>Sign In</h3>);
    const q = qs(this.context.router.route.location.search);
    const message = q._message
      ? (<Alert bsStyle='danger'><strong>Error</strong> {q._message}</Alert>)
      : null;
    return (
      <PageRoot title='login'>
        {message}
        <div className='center-block' id='login-container'>
          <Panel header={title} bsStyle='primary'>
            <Row>
              <SocialLoginPane />
              <LocalLoginPane />
            </Row>
          </Panel>
        </div>
      </PageRoot>
    );
  }
}
LoginComponent.contextTypes = {
  router: PropTypes.object
};
