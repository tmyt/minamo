import React from 'react';
import Terminal from 'xterm/dist/xterm';
import Socket from 'socket.io-client';
import TerminalOpener from './terminal-opener';
import * as fit from 'xterm/dist/addons/fit/fit';

Terminal.applyAddon(fit);

export default class Xterm extends React.Component{
  get ctrl() { return this.state.ctrl; }
  set ctrl(x) { this.setState({ctrl: x}); }
  get alt() { return this.state.alt; }
  set alt(x) { this.setState({alt: x}); }
  constructor(){
    super();
    this.toggleCtrl = () => this.toggle('ctrl');
    this.toggleAlt = () => this.toggle('alt');
    this.pressEsc = () => this.send(0x1b);
    this.state = { ctrl: false, alt: false };
  }
  documentKeyDown(e){
    if(!e.altKey && e.ctrlKey && e.shiftKey && e.key === 'C'){
      e.preventDefault();
      this.copyBuffer.value = this.term.getSelection();
      this.copyBuffer.select();
      document.execCommand('copy');
      this.term.focus();
    }
    if(!e.altKey && e.ctrlKey && e.shiftKey && e.key === 'N' && this.props.isExported){
      e.preventDefault();
      const hasExtension = typeof(chrome) !== 'object'
        && !!document.getElementsByTagName('meta')['mo:extension-available'];
      TerminalOpener.openPopup(this.props.theme, hasExtension);
    }
  }
  loadTheme(/* term */){
    switch(this.props.theme){
      case 'solarized-light':
        // term.options.theme = System.import('../themes/solarized-light');
        break;
      case 'solarized-dark':
        // term.options.theme = System.import('../themes/solarized-dark');
        break;
    }
  }
  toggle(key){
    switch(key){
      case 'ctrl':
        this.ctrl = !this.ctrl;
        break;
      case 'alt':
        this.alt = !this.alt;
        break;
    }
    this.term.focus();
  }
  send(ch){
    this.term.focus();
    this.socket.emit('data', String.fromCharCode(ch));
  }
  writeData(d){
    if((this.ctrl || this.alt) && d.charCodeAt(0) < 128){
      if(this.ctrl){
        const code = d.toUpperCase().charCodeAt(0) - 0x40;
        this.socket.emit('data', String.fromCharCode(code));
        this.toggle('ctrl');
      }else if(this.alt){
        const ch = d.toLowerCase();
        const code = ch.charCodeAt(0);
        if(0x61 <= code && code <= 0x7a){
          this.socket.emit('data', String.fromCharCode(0x1b) + ch);
          this.toggle('alt');
        }else{
          this.socket.emit('data', d);
        }
      }
    }else{
      this.socket.emit('data', d);
    }
  }
  componentDidMount(){
    // bind
    this.documentKeyDown = this.documentKeyDown.bind(this);
    // handle copy hotkey
    document.addEventListener('keydown', this.documentKeyDown);
    // activate terminal
    const term = new Terminal({cols: 80, rows: 30, theme: this.props.theme});
    const socket = Socket('/term');
    term.open(this.divTerminal, true);
    term.on('data', d => this.writeData(d.replace(/\x0D\x0A/g, '\n')));
    term.on('resize', d => socket.emit('resize', [d.cols, d.rows]));
    socket.on('data', d => term.write(d));
    socket.on('init', () => socket.emit('resize', [term.cols, term.rows]));
    term.fit();
    term.focus();
    // handle optional events
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
    // load theme
    // if(this.props.theme !== 'default'){ this.loadTheme(term); }
    this.term = term;
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
  isMobile(){
    if(!navigator) return false;
    const ua = navigator.userAgent || '';
    return ua.indexOf('iPhone') >= 0 || ua.indexOf('iPad') >= 0 || ua.indexOf('Android') >= 0;
  }
  render(){
    let webkitClass = '';
    if(typeof document !== 'undefined' && document.body.style.webkitAppearance !== undefined
      && !navigator.userAgent.includes('Edge')) {
      webkitClass = 'chrome';
    }
    const classNames = `${this.props.className||''} xterm-theme-default ${webkitClass}`;
    let buttons = undefined;
    if(this.isMobile()){
      buttons = (
        <div id='terminal-buttons'>
          <button onClick={this.pressEsc}>esc</button>
          <button className={this.ctrl ? 'active' : ''} onClick={this.toggleCtrl}>ctrl</button>
          <button className={this.alt ? 'active' : ''} onClick={this.toggleAlt}>alt</button>
        </div>
      );
    }
    return (
      <div className={classNames} id='terminal-host'>
        <div id='terminal'ref={(div) => this.divTerminal = div}
             onDragOver={this.dragOver.bind(this)} onDrop={this.drop.bind(this)}>
          <textarea type='text' ref={(input) => this.copyBuffer = input} className='copy-buffer' />
          {this.props.children}
        </div>
        {buttons}
      </div>
    );
  }
}
Xterm.defaultProps = {
  isExported: false,
  theme: 'solarized-dark'
};
