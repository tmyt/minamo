import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default class ServiceEnvConfigComponent extends React.Component{
  getInitialState(){
    return { show: true }
  }
  close() {
    this.setState({ show: false });
  }
  render(){
    return (
      <Modal show={this.state.show} onHide={this.close}>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.close}>Save</Button>
          <Button onClick={this.close}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
