import React from 'react';
import { Popover, OverlayTrigger, Glyphicon } from 'react-bootstrap';

const CrxPath = 'https://chrome.google.com/webstore/detail/ppdhipnblajeianfgkcbneadiebfkped/';

export default class ExtensionTipsComponent extends React.Component{
  constructor(props){
    super(props);
    this.popover = (
      <Popover title='Tips'>
        <a href={CrxPath} target='_blank'>minamo.cloud Terminal Extension</a> more better terminal experience!
      </Popover>
    );
  }
  render(){
    if(!this.props.visible) return null;
    return(
      <OverlayTrigger trigger='click' rootClose placement='left' overlay={this.popover}>
        <button><Glyphicon glyph='info-sign' /></button>
      </OverlayTrigger>
    );
  }
}
