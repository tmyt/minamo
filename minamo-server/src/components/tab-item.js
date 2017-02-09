import React from 'react';

export default class TabItem extends React.Component{
  render(){
    const hash = (typeof location === 'object' && location.hash) || '';
    const active = hash === this.props.to || !hash && this.props.default ? 'active' : '';
    return (
      <li className={active}>
        <a href={this.props.to} data-toggle='tab'>{this.props.children}</a>
      </li>
    );
  }
}

