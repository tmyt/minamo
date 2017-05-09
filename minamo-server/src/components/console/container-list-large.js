import React from 'react';
import { Table } from 'react-bootstrap';
import ContainersTableHeaderComponent from './containers-table-header';
import ContainersTableRowComponent from './containers-table-row';

export default class ContainerListLargeComponent extends React.Component{
  render(){
    let data = this.props.data;
    let rows = Object.keys(data).map(container =>
      (<ContainersTableRowComponent name={container} data={data[container]} key={container} />));
    return (
      <div className={this.props.className}>
        <Table hover>
          <thead>
            <ContainersTableHeaderComponent />
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </div>
    );
  }
}
