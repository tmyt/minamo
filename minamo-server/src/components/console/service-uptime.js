import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

export default class ServiceUptimeComponent extends React.Component{
  render(){
    const tooltip = (<Tooltip id={this.props.created}>{this.props.created}</Tooltip>);
    return(
      <OverlayTrigger overlay={tooltip} placement='top'>
        <span>{this.props.uptime}</span>
      </OverlayTrigger>
    );
  }
}
