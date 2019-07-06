import React from 'react';
import { Button, Modal, FormControl } from 'react-bootstrap';
import Http from './http-verb';
import Toast from '../toast';

export default class ModalKeyName extends React.Component{
  constructor(props){
    super(props);
    this.state = {showModal: false, name: ''};
  }
  close(){
    this.setState({showModal: false});
  }
  open(){
    this.setState({showModal: true});
  }
  openWith(key){
    this.setState({name: key.name, id: key.id});
    this.open();
  }
  save(e){
    e.preventDefault();
    Http.post(`/api/credentials/fido/update`, {name: this.state.name, id: this.state.id},
      () => { Toast.show('Key name updated!', 'success'); this.props.onUpdated(); },
      () => Toast.show('Key name update failed', 'warning')
    );
    this.close();
  }
  handleChange(e){
    this.setState({name: e.target.value});
  }
  render(){
    return (
      <Modal show={this.state.showModal} onHide={this.close.bind(this)}>
        <Modal.Header>
          <Modal.Title>Change key name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.save.bind(this)}>
            <FormControl value={this.state.name} onChange={e => this.handleChange(e)}/>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={this.save.bind(this)}>save</Button>
          <Button variant='outline-primary' onClick={this.close.bind(this)}>cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
