import React from 'react';
import { Badge } from 'react-bootstrap';

export default class ServiceStatusComponent extends React.Component{
  render(){
    const style = this.props.status.toLabelColor();
    return(<Badge variant={style}>{this.props.status.toString()}</Badge>);
  }
}
