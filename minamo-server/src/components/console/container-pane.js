import React from 'react';
import { Col, Row, PanelGroup, Panel } from 'react-bootstrap';

import ServiceStatus from './service-status';
import ServiceLink from './service-link';
import ServiceHead from './service-head';
import ServiceUptime from './service-uptime';
import ServiceRepoUri from './service-repo-uri';
import ServiceAction from './service-action';
import ServiceRemoveButton from './service-remove-button';

import ContainerStatus from './container-status';

export default class ContainerPaneComponent extends React.Component{
  render(){
    let data = this.props.data;
    let status = new ContainerStatus(data.status);
    let header = (
      <Row>
        <Col xs={6}>
          <h4 className="visible-xs-inline">{this.props.name}</h4>
        </Col>
        <Col xs={6} className="text-right">
          <ServiceStatus status={status} />
        </Col>
      </Row>
    );
    return (
      <PanelGroup>
        <Panel header={header} collapsible>
          <dl className="dl-horizontal">
            <dt>service</dt>
            <dd><ServiceLink service={this.props.name} /></dd>
            <dt>head</dt>
            <dd><ServiceHead head={data.head} external={data.repo==='external'} /></dd>
            <dt>uptime</dt>
            <dd><ServiceUptime created={new Date(data.created).toLocaleString()} uptime={data.uptime} /></dd>
            <dt>repo</dt>
            <dd><ServiceRepoUri name={this.props.name} authkey={data.key} /></dd>
          </dl>
          <ServiceAction name={this.props.name} status={status} />
          <span> </span>
          <ServiceRemoveButton name={this.props.name} />
        </Panel>
      </PanelGroup>
    );
  }
}
