import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import Http from '../../components/console/http-verb';
import Toast from '../../components/toast';

const ContainerRegexpString = '[a-z][a-z0-9-]*[a-z0-9]';
const ContainerRegexp = new RegExp(`^${ContainerRegexpString}\$`);

export default class ConsoleCreateComponent extends React.Component{
  constructor(){
    super();
    this.state = { name: '', template: '', external: '' };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getValidationState(){
    if(!this.state.name) return null;
    return ContainerRegexp.test(this.state.name) ? 'success' : 'error'
  }

  getValidationHelp(){
    if(this.getValidationState() !== 'error') return '';
    return `error: service name should be ${ContainerRegexpString}`;
  }

  isExternalRepository(){
    return !this.state.external;
  }

  handleChange(field){
    return (e) => {
      this.setState({[field]: e.target.value});
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
    this.setState({ name: '', template: '', external: '' });
  }

  render(){
    return (
      <div>
        <h2>Create containers</h2>
        <form onSubmit={this.handleSubmit}>
          <FormGroup validationState={this.getValidationState()}>
            <ControlLabel>Name</ControlLabel>
            <FormControl value={this.state.name} onChange={this.handleChange('name')}/>
            <FormControl.Feedback />
            <HelpBlock>{this.getValidationHelp()}</HelpBlock>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Template</ControlLabel>
            <FormControl disabled={!this.isExternalRepository()} componentClass='select' onChange={this.handleChange('template')}>
              <option value=''>Blank</option>
              <option value='simple-webapi'>SimpleWebAPI</option>
              <option value='express-pug'>ExpressPug</option>
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>External Repository (optional)</ControlLabel>
            <FormControl value={this.state.external} onChange={this.handleChange('external')}/>
          </FormGroup>
          <Button bsStyle='primary' type='submit' disabled={this.getValidationState() !== 'success'}>create</Button>
        </form>
      </div>
    );
  }
}
