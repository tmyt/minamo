import React from 'react';
import Terminal from 'xterm';
import Socket from 'socket.io-client';
import 'xterm/lib/addons/fit/fit';

import PageRoot from '../components/page-root';
import ExtensionTips from '../components/extension-tips';

export default class TerminalComponent extends React.Component{
  constructor(){
    super();
    this.state = {tipsVisible: false};
  }
  documentKeyDown(e){
    if(!e.altKey && e.ctrlKey && e.shiftKey && e.key === 'C'){
      e.preventDefault();
      document.execCommand('copy');
    }
  }
  componentDidMount(){
    // check chrome extension availability
    if(typeof(chrome) === 'object' && !document.getElementById('x-minamo-openterminal-extension')){
      this.setState({tipsVisible: true});
    }
    // handle copy hotkey
    document.addEventListener('keydown', this.documentKeyDown);
    // activate terminal
    const term = new Terminal(80, 30);
    const socket = Socket('/term');
    term.open(document.getElementById('terminal'));
    term.on('data', d => socket.emit('data', d.replace(/\x0D\x0A/g, '\n')));
    term.on('resize', d => socket.emit('resize', [d.cols, d.rows]));
    socket.on('data', d => term.write(d));
    socket.on('init', () => socket.emit('resize', [term.cols, term.rows]));
    term.fit();
    if(typeof(isExported) !== 'undefined'){
      let timer = null;
      window.addEventListener('resize', () => {
        clearTimeout(timer);
        timer = setTimeout(() => term.fit(), 100);
      });
      term.on('title', d => document.title = d);
      socket.on('exit', d => window.close());
    }
    this.socket = socket;
  }
  componentWillUnmount(){
    // remove handler
    document.removeEventListener('keydown', this.documentKeyDown);
    this.socket.disconnect();
  }
  openPopup(){
    const popupWindowFeatures = {
      width: 800,
      height: 480,
      menubar: 'no',
      toolbar: 'no',
      location: 'no',
      directories: 'no',
      personalbar: 'no',
      status: 'no',
      resizable: 'yes',
      scrollbars: 'no',
    };
    const features = Object.keys(popupWindowFeatures).map(x => `${x}=${popupWindowFeatures[x]}`).join(',');
    openPopup.addEventListener('click', () => {
      if(document.getElementById('x-minamo-openterminal-extension')){
        let e = new CustomEvent('x-minamo-openterminal', {detail: { url: location.protocol + location.host + '/console/terminal_popup'}});
        window.dispatchEvent(e);
        return;
      }
      window.open('/console/terminal_popup', `terminal-${Date.now()}`, features);
    });
  }
  render(){
    return (
      <PageRoot title='terminal'>
        <ExtensionTips visible={this.state.tipsVisible}/>
        <h2>Terminal</h2>
        <div id='terminal' />
      </PageRoot>
    );
  }
}

/*
setTimeout(() => {
  // check chrome extension availability
  if(typeof(chrome) !== 'object') return;
  if(document.getElementById('x-minamo-openterminal-extension')) return;
  
  // create tips
  let element = document.createElement('div');
  ReactDOM.render(<ExtensionTipsComponent />, element);
  let header = document.getElementById('content-header');
  if(header === null) return;
  header.insertAdjacentElement('beforebegin', element);
}, 1000);
*/
