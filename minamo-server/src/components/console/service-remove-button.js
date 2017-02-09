import React from 'react';
import { Button } from 'react-bootstrap';

import Http from './http-verb';

export default class ServiceRemoveButtonComponent extends React.Component{
  onClick(e) {
    if(!window.confirm('This container permanently removed. Are you sure?')) return;
    Http.del(`/api/services/${this.props.name}`);
  }
  render(){
    return(<Button bsStyle="danger" onClick={this.onClick.bind(this)}>remove</Button>);
  }
}
