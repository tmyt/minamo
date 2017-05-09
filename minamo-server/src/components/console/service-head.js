import React from 'react';

export default class ServiceHeadComponent extends React.Component{
  render(){
    return this.props.external
      ? (<span className='text-muted'>external</span>)
      : (<span>{this.props.head}</span>);
  }
}
