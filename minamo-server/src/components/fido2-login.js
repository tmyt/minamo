import React from 'react';
import PropTypes from 'prop-types';
import EdgeButton from './edge-button';
import FontAwesome from './font-awesome';
import Http from './console/http-verb';
import Toast from './toast';
import qs from '../lib/querystring';
import '../lib/webauthn.js';

export default class Fido2LoginComponent extends React.Component{
  sign(challenge){
    const q = qs(this.context.router.location.search, ['_redir']);
    navigator.authentication.getAssertion(challenge.c)
    .then(result => {
      const uri = '/auth/fido2?'
        + `c=${challenge.c}&cs=${challenge.cs}&`
        + `authenticatorData=${result.authenticatorData}&`
        + `clientData=${result.clientData}&`
        + `signature=${result.signature}&`
        + `id=${result.credential.id}`
        + (q._redir ? `&_redir=${encodeURIComponent(q._redir)}` : '');
      window.location.href = uri;
    });
  }
  authenticate(){
    Http.get('/auth/fido2/challenge', {},
      c => this.sign(c),
      () => Toast.show('Failed to exchange challenge', 'error')
    );
  }
  render(){
    return(
      <EdgeButton bsStyle='primary' onClick={this.authenticate.bind(this)} block>
        <FontAwesome icon='id-card' />
        <span>Login with FIDO 2.0</span>
      </EdgeButton>
    );
  }
}
Fido2LoginComponent.contextTypes = {
  router: PropTypes.object,
  profile: PropTypes.object
};
