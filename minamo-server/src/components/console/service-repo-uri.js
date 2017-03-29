import React from 'react';
import { InputGroup, FormControl, Glyphicon } from 'react-bootstrap';
import Meta from '../meta';

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
          <InputGroup.Addon><Glyphicon glyph='cloud-upload' /></InputGroup.Addon>
          <FormControl readOnly value={this.repo} type='text' onFocus={this.focus} />
        </InputGroup>
      );
    }
    return(
      <FormControl readOnly value={this.repo} type='text' onFocus={this.focus} />
    );
  }
}
