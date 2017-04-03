import React from 'react';
import FontAwesome from '../components/font-awesome';

const BrowserExtensionEvent = 'x-minamo-openterminal';

export default class TerminalOpenerComponent extends React.Component{
  openPopup(){
    const theme = this.props.theme ? '?theme=' + this.props.theme : '';
    const path = '/console/terminal_popup' + theme;
    if(this.props.hasExtension){
      const url = location.protocol + '//' + location.host + path;
      const e = new CustomEvent(BrowserExtensionEvent, { detail: { url } });
      return window.dispatchEvent(e);
    }
    const popupWindowFeatures = 'width=800,height=480,resizable=yes';
    window.open(path, `terminal-${Date.now()}`, popupWindowFeatures);
  }
  render(){
    return (
      <button onClick={this.openPopup.bind(this)} className='external-button'>
        <FontAwesome icon='external-link' />
      </button>
    );
  }
}
