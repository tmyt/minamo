import React from 'react';

export default class FontAwesome extends React.Component{
  render(){
    const prefix = this.props.prefix || 'fa';
    return (
      <i className={`${prefix} fa-${this.props.icon}`} />
    );
  }
}
