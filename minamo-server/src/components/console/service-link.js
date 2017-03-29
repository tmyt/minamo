import React from 'react';
import Meta from '../meta';

export default class ServiceLinkComponent extends React.Component{
  render(){
    const {scheme, domain} = Meta;
    const uri = `${scheme}://${this.props.service}.${domain}`;
    const label = `${this.props.service}${this.props.short ? '' : `.${domain}`}`;
    return (<a href={uri}>{label}</a>);
  }
}
