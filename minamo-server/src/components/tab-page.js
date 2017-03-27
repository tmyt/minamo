import React from 'react';

export default class TabPage extends React.Component{
  render(){
    const attr = this.props.default ? ' in active' : '';
    return(
      <div className={`tab-pane fade${attr}`} id={this.props.id}>
        {this.props.children}
      </div>
    );
  }
}
