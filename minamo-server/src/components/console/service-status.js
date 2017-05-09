import React from 'react';
import { Label } from 'react-bootstrap';

export default class ServiceStatusComponent extends React.Component{
  render(){
    const style = this.props.status.toLabelColor();
    return(<Label bsStyle={style}>{this.props.status.toString()}</Label>);
  }
}
