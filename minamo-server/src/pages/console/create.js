import React from 'react';
import { Button, Form } from 'react-bootstrap';
import FontAwesome from '../../components/font-awesome';
import Http from '../../components/console/http-verb';
import Toast from '../../components/toast';

const ContainerRegexpString = '[a-z][a-z0-9-]*[a-z0-9]';
const ContainerRegexp = new RegExp(`^${ContainerRegexpString}$`);

export default class ConsoleCreateComponent extends React.Component{
  constructor(){
    super();
    this.state = { name: '', template: '', external: '', pending: true, available: false };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.timerId = 0;
  }

  validateName(name){
    return ContainerRegexp.test(name);
  }

  getValidationHelp(){
    if(!this.state.name || this.state.pending) return '';
    if(!this.validateName(this.state.name)) return `error: service name should be ${ContainerRegexpString}`;
    if(!this.state.available) return `error: service name ${this.state.name} is already exists`;
    return '';
  }

  checkContainerName(name){
    clearTimeout(this.timerId);
    this.setState({pending: true, available: false});
    if(!this.validateName(name)){
      this.setState({pending: !name, available: false});
      return;
    }
    this.timerId = setTimeout(() => {
      Http.get('/api/services/available', {service: this.state.name},
        ret => this.updateNameAvailability(ret.available),
        () => this.updateNameAvailability(true)
      );
    }, 500);
  }

  updateNameAvailability(isAvailable){
    this.setState({pending: false, available: isAvailable});
  }

  isExternalRepository(){
    return !this.state.external;
  }

  handleChange(field){
    return (e) => {
      this.setState({[field]: e.target.value});
      if(field === 'name') this.checkContainerName(e.target.value);
    };
  }

  handleSubmit(e){
    e.preventDefault();
    if(!this.state.name.match(ContainerRegexp)){ return; }
    Http.put(`/api/services/${this.state.name}`, {template: this.state.template, external: this.state.external},
      () => {
        Toast.show(`Service "${this.state.name}" created`, 'success');
        this.clearForm();
      },
      (req) => { Toast.show(`Service "${this.state.name}" creation failed. ${req.responseText}`, 'warning'); }
    );
    return;
  }

  clearForm(){
    this.setState({ name: '', external: '' });
  }

  render(){
    const props = {};
    if(!this.state.pending){
      if(this.state.available) props.isValid = true; else props.isInvalid = true;
    }
    return (
      <div>
        <h2>Create containers</h2>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control required value={this.state.name} onChange={this.handleChange('name')} {...props}/>
            <Form.Control.Feedback type='invalid'>{this.getValidationHelp()}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Template</Form.Label>
            <Form.Control noValidate disabled={!this.isExternalRepository()} as='select' onChange={this.handleChange('template')}>
              <option value=''>Blank</option>
              <option value='simple-webapi'>SimpleWebAPI</option>
              <option value='express-pug'>ExpressPug</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>External Repository (optional)</Form.Label>
            <Form.Control noValidate value={this.state.external} onChange={this.handleChange('external')}/>
          </Form.Group>
          <Button variant='primary' type='submit' disabled={!this.state.available}>create</Button>
        </Form>
      </div>
    );
  }
}
