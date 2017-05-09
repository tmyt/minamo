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
  restart(quick){
    const args = quick ? '?quick' : '';
    Http.post(`/api/services/${this.props.name}/restart${args}`);
  }
  restartquick(){
    this.restart(true);
  }
  onSelect(key){
    this[key.replace(/[()\s]/g,'')]();
  }
  render(){
    let commands = ['logs'];
    if(this.props.status.isRunning()){
      commands.push('---', 'stop', 'restart', 'restart (quick)');
    }else if(this.props.status.isStopped()){
      commands.push('---', 'start');
    }
    if(this.props.status.isExited()){
      commands.push('restart (quick)');
    }
    commands.push('---', 'config');
    let items = commands.map((item,i) => item === '---'
      ? (<MenuItem divider key={`---${i}`}/>)
      : (<MenuItem eventKey={item} key={item}>{item}</MenuItem>));
    return (<DropdownButton id={this.props.name} title="Action" onSelect={this.onSelect.bind(this)}>{items}</DropdownButton>);
  }
}
ServiceActionComponent.contextTypes = {
  modalLogs: React.PropTypes.object,
  modalEnv: React.PropTypes.object,
};
