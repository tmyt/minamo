import React from 'react';

export default class TabItem extends React.Component{
  componentDidMount(){
    const hash = (typeof location === 'object' && location.hash) || '';
    if(hash === this.props.to){
      $(this.link).click();
    }
  }
  render(){
    const active = this.props.default ? 'active' : '';
    return (
      <li className={active}>
        <a href={this.props.to} data-toggle='tab' ref={e => this.link = e}>{this.props.children}</a>
      </li>
    );
  }
}

