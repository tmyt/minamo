import React from 'react';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Http from '../../components/console/http-verb';
import Toast from '../../components/toast';

export default class ConsoleConfigureComponent extends React.Component{
  constructor(){
    super();
    this.state = { password: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(){
    Http.post('/api/credentials/update', {password: this.state.password},
      () => Toast.show('Credential update successful', 'success'),
      () => Toast.show('Credential update failed', 'warning')
    );
    return false;
  }

  getValidationState(){
    if(!this.state.name) return null;
    return ContainerRegexp.test(this.state.name) ? 'success' : 'error'
  }

  handleChange(e){
    this.setState({[field]: e.target.value});
  }

  isValidPassword(){
    return this.state.password.length >= 8;
  }

  render(){
    return(
      <div>
        <h2>Configure credentials</h2>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <ControlLabel>Git Username</ControlLabel>
            <FormControl disabled={true}/>
          </FormGroup>
          <FormGroup validationState={this.getValidationState()}>
            <ControlLabel>Git Password</ControlLabel>
            <FormControl componentClass='password' onChange={this.handleChange}/>
            <FormControl.Feedback />
          </FormGroup>
          <input className='btn btn-primary' type='submit' value='update' disabled={this.isValidPassword}/>
        </form>
      </div>
    );
  }
}
