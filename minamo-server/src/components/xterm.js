import React from 'react';
import Terminal from 'xterm/dist/xterm';
import Socket from 'socket.io-client';
import TerminalOpener from './terminal-opener';
import * as fit from 'xterm/dist/addons/fit/fit';

Terminal.applyAddon(fit);

export default class Xterm extends React.Component{
  documentKeyDown(e){
    if(!e.altKey && e.ctrlKey && e.shiftKey && e.key === 'C'){
      e.preventDefault();
      document.execCommand('copy');
    }
    if(!e.altKey && e.ctrlKey && e.shiftKey && e.key === 'N' && this.props.isExported){
      e.preventDefault();
      const hasExtension = typeof(chrome) !== 'object'
        && !!document.getElementsByTagName('meta')['mo:extension-available'];
      TerminalOpener.openPopup(this.props.theme, hasExtension);
    }
  }
  loadTheme(){
    switch(this.props.theme){
      case 'solarized-light':
        System.import('../themes/solarized-light.scss');
        break;
      case 'solarized-dark':
        System.import('../themes/solarized-dark.scss');
        break;
    }
  }
  componentDidMount(){
    // bind
    this.documentKeyDown = this.documentKeyDown.bind(this);
    // load theme
    if(this.props.theme !== 'default'){ this.loadTheme(); }
    // handle copy hotkey
    document.addEventListener('keydown', this.documentKeyDown);
    // activate terminal
    const term = new Terminal({cols: 80, rows: 30, theme: this.props.theme});
    const socket = Socket('/term');
    term.open(this.divTerminal, true);
    term.on('data', d => socket.emit('data', d.replace(/\x0D\x0A/g, '\n')));
    term.on('resize', d => socket.emit('resize', [d.cols, d.rows]));
    socket.on('data', d => term.write(d));
    socket.on('init', () => socket.emit('resize', [term.cols, term.rows]));
    term.fit();
    if(this.props.isExported){
      window.addEventListener('resize', () => {
        window.requestAnimationFrame(() => term.fit());
      });
      term.on('title', d => this.changeTitle(d));
      socket.on('exit', () => {this.connected = false; window.close();});
    }else{
      socket.on('exit', () => {
        socket.disconnect();
        socket.connect();
      });
    }
    this.divTerminal.className += ` xterm-theme-${this.props.theme}`;
    this.socket = socket;
    this.connected = true;
  }
  componentWillUnmount(){
    // remove handler
    document.removeEventListener('keydown', this.documentKeyDown);
    this.socket.disconnect();
  }
  drop(e){
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = content => {
      this.socket.emit('data', content.target.result);
    };
    reader.readAsBinaryString(file);
  }
  dragOver(e){
    e.preventDefault();
  }
  changeTitle(s){
    document.title = s;
    if(typeof(this.props.onChangeTitle) === 'function'){
      this.props.onChangeTitle(s);
    }
  }
  render(){
    let webkitClass = '';
    if(typeof document !== 'undefined' && document.body.style.webkitAppearance !== undefined){
      webkitClass = 'chrome';
    }
    return (
      <div className={`${this.props.className||''} xterm-theme-default ${webkitClass}`} id='terminal'
            ref={(div) => this.divTerminal = div} onDragOver={this.dragOver.bind(this)} onDrop={this.drop.bind(this)}>
        {this.props.children}
      </div>
    );
  }
}
Xterm.defaultProps = {
  isExported: false,
  theme: 'solarized-dark'
};
