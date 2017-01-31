import React from 'react';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export default class ConsoleButtonComponent extends React.Component{
  constructor(){
    super();
  }
  render(){
    return (
      <LinkContainer to={this.context.isAuthenticated ? '/console' : '/login'}>
        <Button bsStyle='primary' bsSize='large'>{this.context.isAuthenticated ? 'console' : 'login'}</Button>
      </LinkContainer>
    );
  }
}
ConsoleButtonComponent.contextTypes = {
  isAuthenticated: React.PropTypes.bool
};
