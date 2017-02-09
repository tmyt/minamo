import React from 'react';

export default class ServiceLinkComponent extends React.Component{
  render(){
    const c = MinamoConfig;
    const uri = `${c.proto}//${this.props.service}.${c.domain}`;
    const label = `${this.props.service}${this.props.short ? '' : `.${c.domain}`}`;
    return (<a href={uri}>{label}</a>);
  }
}
