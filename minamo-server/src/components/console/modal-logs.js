import React from 'react';
import { Button, Modal, FormControl } from 'react-bootstrap';

export default class ModalLogs extends React.Component{
  constructor(){
    super();
    this.state = {showModal: false, logs: ''};
  }
  close(){
    this.setState({showModal: false});
  }
  open(){
    this.setState({showModal: true});
  }
  openWith(logs){
    this.setState({logs});
    this.open();
  }
  render(){
    return (
      <Modal show={this.state.showModal} onHide={this.close.bind(this)}>
        <Modal.Header>
          <Modal.Title>Logs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormControl as='textarea' readOnly rows='15' value={this.state.logs} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.close.bind(this)}>close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
