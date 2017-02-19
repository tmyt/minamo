import React from 'react';
import {Button, Tooltip, OverlayTrigger} from 'react-bootstrap';

export default class EdgeButton extends React.Component{
  render(){
    const isEdge = typeof msCredentials !== 'undefined';
    const tooltip = <Tooltip id='edge-info'>Currently only supported on Edge</Tooltip>;
    if(isEdge) return (<Button {...this.props} />);
    const className = this.props.block ? 'btn-block' : '';
    return (
      <OverlayTrigger rootClose placement='top' overlay={tooltip}>
        <span style={{cursor: 'not-allowed'}} className={className}>
          <Button style={{pointerEvents: 'none'}} disabled={true} {...this.props} />
        </span>
      </OverlayTrigger>
    );
  }
}
