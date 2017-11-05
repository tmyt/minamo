import React from 'react';
import { Glyphicon } from 'react-bootstrap';

const BrowserExtensionEvent = 'x-minamo-openterminal';

export default class TerminalOpenerComponent extends React.Component{
  static openPopup(themeName, hasExtension){
    const theme = themeName ? `?theme=${themeName}` : '';
    const path = '/shell' + theme;
    if(hasExtension){
      const url = location.protocol + '//' + location.host + path;
      const e = new CustomEvent(BrowserExtensionEvent, { detail: { url } });
      return window.dispatchEvent(e);
    }
    const popupWindowFeatures = 'width=800,height=480,resizable=yes';
    window.open(path, `terminal-${Date.now()}`, popupWindowFeatures);
  }
  handleClick(){
    TerminalOpenerComponent.openPopup(this.props.theme, this.props.hasExtension);
  }
  render(){
    return (
      <button onClick={this.handleClick.bind(this)}>
        <Glyphicon glyph='new-window' />
      </button>
    );
  }
}
