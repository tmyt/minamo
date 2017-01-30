import React from 'react';

export default class FontAwesome extends React.Component{
  render(){
    return (
      <i className={`fa fa-${this.props.icon}`} />
    );
  }
}
