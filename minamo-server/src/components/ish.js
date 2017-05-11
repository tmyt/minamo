import React from 'react';

export default class IntegratedShell extends React.Component {
  constructor(){
    super();
    this.state = {ishHeight: 200};
    this.handleDown = this.handleDown.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleMove = this.handleMove.bind(this);
  }
  componentDidMount(){
    window.addEventListener('mouseup', this.handleUp);
  }
  componentWillUnmount(){
    window.removeEventListener('mouseup', this.handleUp);
  }
  handleDown(e){
    this.lastDownY = e.clientY;
    this.iframe.style.pointerEvents = 'none';
    window.addEventListener('mousemove', this.handleMove);
  }
  handleUp(e){
    window.removeEventListener('mousemove', this.handleMove);
    this.iframe.style.pointerEvents = '';
  }
  handleMove(e){
    e.preventDefault();
    const delta = e.clientY - this.lastDownY;
    this.lastDownY = e.clientY;
    this.setState({ishHeight: this.state.ishHeight - delta});
  }
  render(){
    if(!this.props.visible) return null;
    return (
      <div style={{height: `${this.state.ishHeight}px`, background: '#000'}}>
        <header className='ish-resize' onMouseDown={this.handleDown} />
        <iframe src='/console/terminal_popup' role='document' sandbox='allow-scripts allow-same-origin allow-popups' ref={e => this.iframe = e}/>
      </div>
    );
  }
}
