import React from 'react';
import { InputGroup, Form } from 'react-bootstrap';
import Meta from '../meta';
import FontAwesome from '../font-awesome';

export default class ServiceRepoUri extends React.Component{
  focus(e){
    e.target.select();
  }
  render(){
    const {scheme, domain} = Meta;
    this.repo = `${scheme}://git.${domain}/${this.props.name}.git`;
    if(this.props.authkey){
      this.repo = `${scheme}://${domain}/api/hooks/${this.props.name}?key=${this.props.authkey}`;
      return(
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text><FontAwesome icon='cloud-upload' /></InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control readOnly value={this.repo} type='text' onFocus={this.focus} />
        </InputGroup>
      );
    }
    return(
      <Form.Control readOnly value={this.repo} type='text' onFocus={this.focus} />
    );
  }
}
