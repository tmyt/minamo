import React from 'react';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export default class ConsoleButtonComponent extends React.Component{
  constructor(){
    super();
    this.state = { isLoggedIn: false };
  }
  render(){
    return (
      <LinkContainer to={this.state.isLoggedIn ? '/console' : '/login'}>
        <Button bsStyle='primary' bsSize='large'>{this.state.isLoggedIn ? 'console' : 'login'}</Button>
      </LinkContainer>
    );
  }
}
