import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Panel, Row, Col, Button, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
import qs from '../lib/querystring';

import FontAwesome from '../components/font-awesome';
import PageRoot from '../components/page-root';
import Fido2LoginButton from '../components/fido2-login';

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
        <Fido2LoginButton />
      </Col>
    );
  }
}
SocialLoginPane.contextTypes = {
  router: PropTypes.object
};

class LocalLoginPane extends React.Component{
  render(){
    const args = qs.export(this.context.router, ['_redir']);
    return (
      <Col sm={6}>
        <h4 className='header'>minamo id</h4>
        <form method='post' action={`/auth/local${args}`}>
          <FormGroup className='vertical-grouped'>
            <InputGroup>
              <InputGroup.Addon>
                <FontAwesome icon='user' />
              </InputGroup.Addon>
              <FormControl name='username' placeholder='Username' />
            </InputGroup>
            <InputGroup>
              <InputGroup.Addon>
                <FontAwesome icon='key' />
              </InputGroup.Addon>
              <FormControl name='password' placeholder='Password' type='password' />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Button bsStyle='primary' type='submit' block>Sign In</Button>
          </FormGroup>
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
