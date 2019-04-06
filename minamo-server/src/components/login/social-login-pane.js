import React from 'react';
import { withRouter } from 'react-router';
import { Col, Button } from 'react-bootstrap';

import FontAwesome from '../font-awesome';
import qs from '../../lib/querystring';

class SocialLoginPane extends React.Component{
  render(){
    const args = qs.export(this.props.location, ['_redir']);
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

export default withRouter(SocialLoginPane);
