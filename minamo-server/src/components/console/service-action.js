import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import PropTypes from 'prop-types';

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
      ? (<Dropdown.Divider key={`---${i}`}/>)
      : (<Dropdown.Item eventKey={item} key={item}>{item}</Dropdown.Item>));
    return (<DropdownButton variant='outline-primary' id={this.props.name} title="Action" onSelect={this.onSelect.bind(this)}>{items}</DropdownButton>);
  }
}
ServiceActionComponent.contextTypes = {
  modalLogs: PropTypes.object,
  modalEnv: PropTypes.object,
};
