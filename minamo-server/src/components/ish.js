import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import TerminalOpener from './terminal-opener';

export default class IntegratedShell extends React.Component {
  constructor(){
    super();
    this.state = {ishHeight: 400, tipsVisible: false, hasExtension: false};
    this.handleDown = this.handleDown.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleCloseISH = this.handleCloseISH.bind(this);
  }
  componentDidMount(){
    document.addEventListener('mouseup', this.handleUp);
    this.detectExtension();
  }
  componentWillUnmount(){
    document.removeEventListener('mouseup', this.handleUp);
  }
  hasExtension(){
    return !!document.getElementsByTagName('meta')['mo:extension-available'];
  }
  detectExtension(){
    if(typeof(chrome) !== 'object'){ return; }
    const available = this.hasExtension();
    this.setState({tipsVisible: !available, hasExtension: available});
  }
  handleDown(e){
    this.lastDownY = e.clientY;
    this.iframe.style.pointerEvents = 'none';
    document.addEventListener('mousemove', this.handleMove);
  }
  handleUp(e){
    document.removeEventListener('mousemove', this.handleMove);
    if(this.iframe){
      this.iframe.style.pointerEvents = '';
    }
  }
  handleMove(e){
    e.preventDefault();
    const delta = e.clientY - this.lastDownY;
    this.lastDownY = e.clientY;
    this.setState({ishHeight: this.state.ishHeight - delta});
  }
  handleCloseISH(){
    if(typeof(this.props.onCloseISH) === 'function'){
      this.props.onCloseISH();
    }
  }
  render(){
    if(!this.props.visible) return null;
    return (
      <div style={{height: `${this.state.ishHeight}px`, background: '#000'}}>
        <header className='ish-resize' onMouseDown={this.handleDown} />
        <div className='ish-bar'>
          <div id='ish-title'>
            Integrated Shell
          </div>
          <div id='ish-buttons'>
            <TerminalOpener hasExtension={this.state.hasExtension}/>
            <button onClick={this.handleCloseISH}>
              <Glyphicon glyph='remove' />
            </button>
          </div>
        </div>
        <iframe src='/console/terminal' role='document' sandbox='allow-scripts allow-same-origin allow-popups' ref={e => this.iframe = e}/>
      </div>
    );
  }
}
