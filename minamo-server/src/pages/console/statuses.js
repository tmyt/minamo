import React from 'react';
import Socket from 'socket.io-client';

import ModalLogs from '../../components/console/modal-logs';
import ModalEnv from '../../components/console/modal-env';
import ContainerGroup from '../../components/console/container-group';

export default class ConsoleStatusesComponent extends React.Component{
  constructor(){
    super();
    this.state = {data:(typeof window === 'object' && window['x-minamo-cache-statuses']) || {}};
  }
  getChildContext(){
    return {modalLogs: this.modalLogsInstance, modalEnv: this.modalEnvInstance};
  }
  componentWillMount(){
    this.modalLogs = (<ModalLogs ref={x => this.modalLogsInstance = x} />);
    this.modalEnv = (<ModalEnv ref={x => this.modalEnvInstance = x} />);
  }
  componentDidMount(){
    const socket = Socket('/status');
    socket.on('statuses', data => {
      this.setState({data});
      window['x-minamo-cache-statuses'] = data;
    });
    this.socket = socket;
  }
  componentWillUnmount(){
    this.socket.disconnect();
    this.socket = null;
  }
  render(){
    return(
      <div>
        <h2>Container status</h2>
        <ContainerGroup data={this.state.data} />
        {this.modalEnv}
        {this.modalLogs}
      </div>
    );
  }
}
ConsoleStatusesComponent.childContextTypes = {
  modalEnv: React.PropTypes.object,
  modalLogs: React.PropTypes.object,
};
