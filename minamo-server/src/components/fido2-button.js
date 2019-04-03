import React from 'react';
import {Button, Tooltip, OverlayTrigger} from 'react-bootstrap';

function isCredentialsSupported(){
  return typeof PublicKeyCredential !== 'undefined';
}

export default class Fido2Button extends React.Component{
  render(){
    const tooltip = <Tooltip id='edge-info'>Your browser has no WebAuthn support.</Tooltip>;
    if(isCredentialsSupported()) return (<Button {...this.props} />);
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
