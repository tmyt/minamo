import React from 'react';
import { Button } from 'react-bootstrap';
import FontAwesome from '../components/font-awesome';
import '../lib/webauthn.js';

export default class Fido2LoginComponent extends React.Component{
  authenticate(){
    const challenge = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    navigator.authentication.getAssertion(challenge)
    .then(result => {
      const uri = '/auth/fido2?'
        + `authenticatorData=${result.authenticatorData}&`
        + `clientData=${result.clientData}&`
        + `signature=${result.signature}&`
        + `id=${result.credential.id}&`
        + this.context.router.location.search.substring(1);
      window.location.href = uri;
    });
  }
  render(){
    return(
      <Button bsStyle='primary' onClick={this.authenticate.bind(this)} block>
        <FontAwesome icon='id-card' />
        <span>Login with FIDO 2.0</span>
      </Button>
    );
  }
}
Fido2LoginComponent.contextTypes = {
  router: React.PropTypes.object,
  profile: React.PropTypes.object
}
