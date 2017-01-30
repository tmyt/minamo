import React from 'react';
import { Panel, Row, Col,FormGroup, FormControl, InputGroup } from 'react-bootstrap';

import FontAwesome from '../components/font-awesome';
import PageRoot from '../components/page-root';

class SocialLoginPane extends React.Component{
  render(){
    return (
      <Col sm={6}>
        <h4 className='header'>social account</h4>
        <a className='btn btn-large btn-block btn-primary' href='/auth/twitter'>
          <FontAwesome icon='twitter' />
          <span>Login with Twitter</span>
        </a>
        <a className='btn btn-large btn-block btn-primary' href='/auth/github'>
          <FontAwesome icon='github' />
          <span>Login with GitHub</span>
        </a>
      </Col>
    );
  }
}

class LocalLoginPane extends React.Component{
  render(){
    return (
      <Col sm={6}>
        <h4 className='header'>minamo id</h4>
        <form method='post' action='/auth/local'>
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
            <input className='btn btn-large btn-primary btn-block' type='submit' value='Sign In' />
          </FormGroup>
        </form>
      </Col>
    );
  }
}

export default class LoginComponent extends React.Component{
  render(){
    const title = (<h3>Sign In</h3>);
    return (
      <PageRoot title='login'>
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
