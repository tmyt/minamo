import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Row, Col, Table } from 'react-bootstrap';
import Dropzone from 'react-dropzone-component';
import SocialConnect from '../../components/console/social-connect';
import Http from '../../components/console/http-verb';
import Toast from '../../components/toast';
import Fido2Button from '../../components/fido2-button';
import FontAwesome from '../../components/font-awesome';
import ModalKeyName from '../../components/console/modal-key-name';

export default class ConsoleConfigureComponent extends React.Component{
  render(){
    return(
      <div>
        <h2>Configure profile</h2>
        <h3>minamo id</h3>
        <MinamoIdForm />
        <h3>Connect social account</h3>
        <SocialConnect />
        <h3>Register FIDO 2.0 credential</h3>
        <Fido2Form />
      </div>
    );
  }
}
ConsoleConfigureComponent.contextTypes = {
  profile: PropTypes.object
};

// Form Component for minamo id
class MinamoIdForm extends React.Component{
  constructor(){
    super();
    this.state = { password: '', avatar: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e){
    this.setState({password: e.target.value});
  }
  handleSubmit(e){
    Http.post('/api/users/profile/update', {password: this.state.password, avatar: this.state.avatar},
      () => {
        Toast.show('Profile update successful', 'success');
        this.setState({password: '', avatar: ''});
      },
      () => Toast.show('Profile update failed', 'warning')
    );
    e.preventDefault();
    return false;
  }
  getValidationState(){
    if(!this.state.password) return null;
    return this.isValidPassword() ? 'success' : 'error';
  }
  isValidPassword(){
    return this.state.password.length >= 8;
  }
  isValidFormData(){
    if(!this.state.password && this.state.avatar) return true;
    return this.isValidPassword();
  }
  render(){
    const componentConfig = {postUrl: '/api/users/avatar/upload'};
    const djsConfig = {maxFiles: 1, dictDefaultMessage: '<span class="fa fa-upload fa-3x"></i>'};
    const eventHandlers = {
      addedfile: function(){
        if(this.files[1]) { this.removeFile(this.files[0]); }
      },
      success: (e, res) => {
        this.setState({avatar: res});
      }
    };
    const props = {};
    if(this.state.password){
      if(this.isValidFormData()) props.isValid = true; else props.isInvalid = true;
    }
    return(
      <Form onSubmit={this.handleSubmit}>
        <Row>
          <Col sm={8}>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control disabled={true} value={this.context.profile.username}/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' onChange={this.handleChange} value={this.state.password} {...props}/>
              <Form.Control.Feedback />
            </Form.Group>
          </Col>
          <Col sm={4}>
            <Form.Group>
              <Form.Label>Image</Form.Label>
              <div>
                <Dropzone config={componentConfig} eventHandlers={eventHandlers} djsConfig={djsConfig}/>
              </div>
            </Form.Group>
          </Col>
        </Row>
        <Button variant='primary' type='submit' disabled={!this.isValidFormData()}>update</Button>
      </Form>
    );
  }
}
MinamoIdForm.contextTypes = {
  profile: PropTypes.object
};

// Form Component for FIDO2 Credential
class Fido2Form extends React.Component{
  constructor(){
    super();
    this.state = {keys: []};
  }
  componentWillMount(){
    this.modalKeyName = (<ModalKeyName ref={x => this.modalKeyNameInstance = x} onUpdated={() => this.updateKeys()}/>);
  }
  componentDidMount(){
    this.updateKeys();
  }
  registerCredential(){
    fetch('/auth/fido2/create')
      .then(result => result.json())
      .then(options => {
        options.challenge = new Uint8Array(options.challenge);
        options.user.id = new Uint8Array([].map.call(options.user.id, c => c.charCodeAt(0)));
        return navigator.credentials.create({ publicKey: options });
      })
      .then(result => {
        const obj = {
          id: result.id,
          rawId: Array.from(new Uint8Array(result.rawId)),
          response: {
            attestationObject: Array.from(new Uint8Array(result.response.attestationObject)),
            clientDataJSON: Array.from(new Uint8Array(result.response.clientDataJSON)),
          },
        };
        Http.post('/auth/fido2/register', {result: JSON.stringify(obj)},
          () => { Toast.show('FIDO key registered', 'success'); this.updateKeys(); },
          () => Toast.show('Key registration failed', 'warning')
        );
      });
  }
  updateKeys(){
    fetch('/api/credentials/fido/list')
      .then(result => result.json())
      .then(keys => this.setState({keys}));
  }
  onEditClick(key){
    this.modalKeyNameInstance.openWith(key);
  }
  onRemoveClick(key){
    if(window.confirm(`Remove key "${key.name}"?`)){
      Http.post('/api/credentials/fido/remove', {id: key.id},
        () => { Toast.show(`FIDO key ${key.name} has removed`, 'success'); this.updateKeys(); },
        () => Toast.show('Key remove faild', 'warning')
      );
    }
  }
  render(){
    const keys = this.state.keys.map(key => {
      return(
        <tr key={key.id}>
          <td>{key.name}</td>
          <td>
            <Button variant='outline-primary' onClick={() => this.onEditClick(key)}><FontAwesome icon='edit' /></Button>
            <Button variant='outline-danger' onClick={() => this.onRemoveClick(key)}><FontAwesome icon='trash' /></Button>
          </td>
        </tr>
      );
    });
    return(
      <div>
        <h4>Registered keys</h4>
        <Table className='keys'>
          <tbody>
            {keys}
          </tbody>
        </Table>
        <h4>Register new key</h4>
        <form>
          <Fido2Button variant='primary' onClick={this.registerCredential.bind(this)}>register</Fido2Button>
        </form>
        {this.modalKeyName}
      </div>
    );
  }
}
Fido2Form.contextTypes = {
  profile: PropTypes.object
};
