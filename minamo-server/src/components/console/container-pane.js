import React from 'react';
import { Col, Row, CardGroup, Card } from 'react-bootstrap';

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
    const data = this.props.data;
    const status = new ContainerStatus(data.status);
    const header = (
      <a data-toggle='collapse' className='text-body stretched-link text-decoration-none'
         href={'#collapse-' + this.props.name} aria-expanded='true' aria-controls={'collapse-' + this.props.name}>
        <h4>{this.props.name}</h4>
        <div className='ml-auto'>
          <ServiceStatus status={status} />
        </div>
      </a>
    );
    return (
      <CardGroup className='accordion'>
        <Card>
          <Card.Header>{header}</Card.Header>
          <Card.Body className='collapse' id={'collapse-' + this.props.name}>
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
            <ServiceRemoveButton name={this.props.name} />
          </Card.Body>
        </Card>
      </CardGroup>
    );
  }
}
