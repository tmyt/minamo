import React from 'react';

import ServiceLink from './service-link';
import ServiceStatus from './service-status';
import ServiceHead from './service-head';
import ServiceUptime from './service-uptime';
import ServiceRepoUri from './service-repo-uri';
import ServiceAction from './service-action';
import ServiceRemoveButton from './service-remove-button';

import ContainerStatus from './container-status';

export default class ContainersTableRowComponent extends React.Component{
  render(){
    let data = this.props.data;
    let status = new ContainerStatus(data.status);
    return (
      <tr className="container_row">
        <td><ServiceLink service={this.props.name} short /></td>
        <td><ServiceStatus status={status} /></td>
        <td><ServiceHead head={data.head} external={data.repo==='external'} /></td>
        <td><ServiceUptime created={new Date(data.created).toLocaleString()} uptime={data.uptime} /></td>
        <td><ServiceRepoUri name={this.props.name} authkey={data.key} /></td>
        <td><ServiceAction name={this.props.name} status={status}/></td>
        <td><ServiceRemoveButton name={this.props.name} /></td>
      </tr>
    );
  }
}
