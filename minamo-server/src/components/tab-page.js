import React from 'react';

export default class TabPage extends React.Component{
  render(){
    const hash = (typeof location === 'object' && location.hash) || '';
    const attr = hash === `#${this.props.id}` || !hash && this.props.default ? ' in active' : '';
    return(
      <div className={`tab-pane fade${attr}`} id={this.props.id}>
        {this.props.children}
      </div>
    );
  }
}
