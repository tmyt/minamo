import React from 'react';
import { withRouter } from 'react-router';

import Xterm from '../components/xterm';
import DocumentTitle from 'react-document-title';
import qs from '../lib/querystring';

class PopupTerminalComponent extends React.Component{
  constructor(){
    super();
    this.state = { theme: undefined };
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onUnload = this.onUnload.bind(this);
  }
  componentWillMount(){
    const args = qs(this.props.location.search, ['theme']);
    this.setState(args);
  }
  componentDidMount(){
    if(this.isMobileChrome()){
      window.addEventListener('resize', this.onResize);
      this.onResize();
      const viewport = document.getElementsByClassName('xterm-viewport')[0];
      viewport.style.width = '100vw';
    }
    window.addEventListener('beforeunload', this.onUnload);
    this.appendLinkHeader();
    if(window.parent !== window){
      this.titleElement = window.parent.document.getElementById('ish-title');
    }
  }
  componentWillUnmount(){
    window.removeEventListener('beforeunload', this.onUnload);
    window.removeEventListener('resize', this.onResize);
    document.head.removeChild(this.manifestLink);
  }
  handleTitleChange(title){
    if(this.titleElement){
      this.titleElement.innerText = title;
    }
  }
  isMobileChrome(){
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidChrome = /chrome/.test(userAgent) && /android/.test(userAgent);
    const isIOSChrome = /crios/.test(userAgent);
    return isAndroidChrome || isIOSChrome;
  }
  appendLinkHeader(){
    const link = document.createElement('link');
    link.href = '/manifest.json';
    link.rel = 'manifest';
    document.head.appendChild(link);
    this.manfiestLink = link;
  }
  onResize(){
    this.xterm.divTerminal.style.height = window.innerHeight + 'px';
  }
  onUnload(e){
    if(!this.xterm.connected || window.parent !== window){
      return;
    }
    e.returnValue = 'Would you close it?';
    return e.returnValue;
  }
  render(){
    return (
      <DocumentTitle title='terminal'>
        <Xterm className='popup' isExported={true} theme={this.state.theme} ref={(xterm) => this.xterm = xterm} onChangeTitle={this.handleTitleChange}/>
      </DocumentTitle>
    );
  }
}

export default withRouter(PopupTerminalComponent);
