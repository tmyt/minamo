import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import TerminalOpener from './terminal-opener';
import ExtensionTips from './extension-tips';
import ActiveEventHandler from './active-event';

export default class IntegratedShell extends React.Component {
  constructor(){
    super();
    this.state = {ishHeight: 400, tipsVisible: false, hasExtension: false};
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleCloseISH = this.handleCloseISH.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
  }
  componentDidMount(){
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('touchend', this.handleTouchEnd);
    window.addEventListener('resize', this.handleWindowResize);
    this.detectExtension();
  }
  componentWillUnmount(){
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('resize', this.handleWindowResize);
  }
  hasExtension(){
    return !!document.getElementsByTagName('meta')['mo:extension-available'];
  }
  detectExtension(){
    if(typeof(chrome) !== 'object'){ return; }
    const available = this.hasExtension();
    this.setState({tipsVisible: !available, hasExtension: available});
  }
  handleMouseDown(e){
    this.lastDownY = e.clientY;
    this.iframe.style.pointerEvents = 'none';
    document.addEventListener('mousemove', this.handleMouseMove);
  }
  handleMouseUp(){
    document.removeEventListener('mousemove', this.handleMouseMove);
    if(this.iframe){ this.iframe.style.pointerEvents = ''; }
    this.setState({ishHeight: this.roundHeight(this.state.ishHeight)});
  }
  handleMouseMove(e){
    e.preventDefault();
    this.handleMove(e.clientY);
  }
  handleTouchStart(e){
    e.preventDefault(); // nazo
    this.lastDownY = e.touches[0].clientY;
    this.iframe.style.pointerEvents = 'none';
    document.addEventListener('touchmove', this.handleTouchMove);
  }
  handleTouchEnd(){
    document.removeEventListener('touchmove', this.handleTouchMove);
    if(this.iframe){ this.iframe.style.pointerEvents = ''; }
    this.setState({ishHeight: this.roundHeight(this.state.ishHeight)});
  }
  handleTouchMove(e){
    this.handleMove(e.touches[0].clientY);
  }
  handleMove(y){
    const delta = y - this.lastDownY;
    this.lastDownY = y;
    this.setState({ishHeight: this.state.ishHeight - delta});
  }
  handleCloseISH(){
    if(typeof(this.props.onCloseISH) === 'function'){
      this.props.onCloseISH();
    }
  }
  handleWindowResize(){
    window.requestAnimationFrame(() => {
      const h = this.roundHeight(this.state.ishHeight);
      if(h < this.state.ishHeight){
        this.setState({ishHeight: h});
      }
    });
  }
  roundHeight(h){
    return Math.min(Math.max(h, 29), window.innerHeight);
  }
  render(){
    if(!this.props.visible) return null;
    return (
      <div id='ish' style={{minHeight: `${Math.max(this.state.ishHeight, 29)}px`}}>
        <header className='ish-resize' onMouseDown={this.handleMouseDown}>
          <ActiveEventHandler event='touchstart' handler={this.handleTouchStart}/>
        </header>
        <div className='ish-bar'>
          <ActiveEventHandler event='touchstart' handler={this.handleTouchStart}/>
          <div id='ish-title'>
            Integrated Shell
          </div>
          <div id='ish-buttons'>
            <ActiveEventHandler event='touchstart' handler={e => e.stopPropagation()}/>
            <ExtensionTips visible={this.state.tipsVisible} />
            <TerminalOpener hasExtension={this.state.hasExtension}/>
            <button onClick={this.handleCloseISH}>
              <Glyphicon glyph='remove' />
            </button>
          </div>
        </div>
        <iframe src='/shell' role='document' sandbox='allow-scripts allow-same-origin allow-popups' ref={e => this.iframe = e}/>
      </div>
    );
  }
}
