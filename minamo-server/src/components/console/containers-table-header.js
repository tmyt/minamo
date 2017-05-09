import React from 'react';

export default class ContainersTableHeaderComponent extends React.Component{
  render(){
    let names = ['name', 'status', 'head', 'uptime', 'repo', 'action', 'remove'];
    let headers = names.map(n => (<th key={`tr_${n}`}>{n}</th>));
    return (<tr>{headers}</tr>);
  }
}
