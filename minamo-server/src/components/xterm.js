import React from 'react';
import Terminal from 'xterm/dist/xterm';
import Socket from 'socket.io-client';
import '../lib/xterm.fit';

export default class Xterm extends React.Component{
  documentKeyDown(e){
    if(!e.altKey && e.ctrlKey && e.shiftKey && e.key === 'C'){
      e.preventDefault();
      document.execCommand('copy');
    }
  }
  componentDidMount(){
    // handle copy hotkey
    document.addEventListener('keydown', this.documentKeyDown);
    // activate terminal
    const term = new Terminal(80, 30);
    const socket = Socket('/term');
    term.open(this.divTerminal);
    term.on('data', d => socket.emit('data', d.replace(/\x0D\x0A/g, '\n')));
    term.on('resize', d => socket.emit('resize', [d.cols, d.rows]));
    socket.on('data', d => term.write(d));
    socket.on('init', () => socket.emit('resize', [term.cols, term.rows]));
    term.fit();
    if(this.props.isExported){
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
  render(){
    return (
      <div className={this.props.className} id='terminal' ref={(div) => this.divTerminal = div}>
        {this.props.children}
      </div>
    );
  }
}
Xterm.defaultProps = {
  isExported: false
};
