import React from 'react';
import { MenuItem, DropdownButton } from 'react-bootstrap';

import Http from './http-verb';

export default class ServiceActionComponent extends React.Component{
  config(){
    Http.get(`/api/services/${this.props.name}/env`, {}, json=>{
      const env = JSON.parse(json);
      const values = Object.keys(env).reduce((p, c) => (p.push({name: c, value: env[c]}), p), []);
      this.context.modalEnv.openWith(this.props.name, values);
    });
  }
  logs(){
    Http.get(`/api/services/${this.props.name}/logs`, {}, logs=>{
      this.context.modalLogs.openWith(logs);
    });
  }
  start(){
    Http.post(`/api/services/${this.props.name}/start`);
  }
  stop(){
    Http.post(`/api/services/${this.props.name}/stop`);
  }
  restart(){
    Http.post(`/api/services/${this.props.name}/restart`);
  }
  onSelect(key, e){
    this[key]();
  }
  render(){
    let commands = ['logs', '---'];
    if(this.props.status.isRunning()){
      commands.push('stop', 'restart', '---');
    }else if(this.props.status.isStopped()){
      commands.push('start', '---');
    }
    commands.push('config');
    let items = commands.map((item,i) => item === '---'
      ? (<MenuItem divider key={`---${i}`}/>)
      : (<MenuItem eventKey={item} key={item}>{item}</MenuItem>));
    return (<DropdownButton id={this.props.name} title="Action" onSelect={this.onSelect.bind(this)}>{items}</DropdownButton>);
  }
}
ServiceActionComponent.contextTypes = {
  modalLogs: React.PropTypes.object,
  modalEnv: React.PropTypes.object,
}
