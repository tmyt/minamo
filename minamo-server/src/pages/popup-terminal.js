import React from 'react';
import PropTypes from 'prop-types';
import Xterm from '../components/xterm';
import DocumentTitle from 'react-document-title';
import qs from '../lib/querystring';

export default class PopupTerminalComponent extends React.Component{
  constructor(){
    super();
    this.state = { theme: undefined };
    this.onResize = this.onResize.bind(this);
    this.onUnload = this.onUnload.bind(this);
  }
  componentWillMount(){
    const args = qs(this.context.router.route.location.search, ['theme']);
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
  }
  componentWillUnmount(){
    window.removeEventListener('beforeunload', this.onUnload);
    window.removeEventListener('resize', this.onResize);
    document.head.removeChild(this.manifestLink);
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
    if(!this.xterm.connected) return;
    e.returnValue = 'Would you close it?';
    return e.returnValue;
  }
  render(){
    return (
      <DocumentTitle title='terminal'>
        <Xterm className='popup' isExported={true} theme={this.state.theme} ref={(xterm) => this.xterm = xterm}/>
      </DocumentTitle>
    );
  }
}
PopupTerminalComponent.contextTypes = {
  router: PropTypes.object
};

