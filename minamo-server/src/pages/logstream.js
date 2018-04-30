import React from 'react';
import Terminal from 'xterm/dist/xterm';
import Socket from 'socket.io-client';

import PageRoot from '../components/page-root';
import * as fit from 'xterm/dist/addons/fit/fit';

Terminal.applyAddon(fit);

export default class LogStreamComponent extends React.Component{
  componentDidMount(){
    const term = new Terminal({cols: 80, rows: 30});
    term.open(document.getElementById('log'));
    term.fit();
    const socket = Socket('/log');
    socket.on('data', d => term.write(d));
    this.socket = socket;
  }
  componentWillUnmount(){
    if(!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }
  render(){
    return (
      <PageRoot title='logstream'>
        <h2>Log Stream</h2>
        <div id='log' />
      </PageRoot>
    );
  }
}
