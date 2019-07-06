import React from 'react';
import { withRouter } from 'react-router';
import { Alert, Card, Row } from 'react-bootstrap';
import qs from '../lib/querystring';

import PageRoot from '../components/page-root';

import SocialLoginPane from '../components/login/social-login-pane';
import LocalLoginPane from '../components/login/local-login-pane';

class LoginComponent extends React.Component{
  render(){
    const title = (<h3>Sign In</h3>);
    const q = qs(this.props.location.search);
    const message = q._message
      ? (<Alert variant='danger'><strong>Error</strong> {q._message}</Alert>)
      : null;
    return (
      <PageRoot title='login'>
        {message}
        <div className='center-block' id='login-container'>
          <Card header={title} variant='primary'>
            <Card.Header>{title}</Card.Header>
            <Card.Body>
              <Row>
                <SocialLoginPane />
                <LocalLoginPane />
              </Row>
            </Card.Body>
          </Card>
        </div>
      </PageRoot>
    );
  }
}

export default withRouter(LoginComponent);
