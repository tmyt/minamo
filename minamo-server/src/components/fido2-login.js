import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import Fido2Button from './fido2-button';
import FontAwesome from './font-awesome';
import Http from './console/http-verb';
import Toast from './toast';
import qs from '../lib/querystring';

class Fido2LoginComponent extends React.Component{
  sign(challenge){
    const q = qs(this.props.location.search, ['_redir']);
    navigator.credentials.get(challenge.c)
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
      <Fido2Button bsStyle='primary' onClick={this.authenticate.bind(this)} block>
        <FontAwesome icon='id-card' />
        <span>Login with FIDO 2.0</span>
      </Fido2Button>
    );
  }
}
Fido2LoginComponent.contextTypes = {
  profile: PropTypes.object
};

export default withRouter(Fido2LoginComponent);
