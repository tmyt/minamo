import React from 'react';
import { Button, Modal, Table, FormControl, Glyphicon } from 'react-bootstrap';
import Http from './http-verb';
import Toast from '../toast';

class EnvItem extends React.Component{
  constructor(props){
    super(props);
    this.state = {name: this.props.name, value: this.props.value};
  }
  handleChange(name){
    return e => {
      this.setState({[name]: e.target.value});
      if(typeof this.props.onChange === 'function'){
        this.props.onChange({
          name: this.state.name,
          value: this.state.value,
          [name]: e.target.value,
          index: this.props.index,
        });
      }
    };
  }
  handleRemove(){
    if(typeof this.props.onRemove === 'function'){
      this.props.onRemove({
        index: this.props.index
      });
    }
  }
  render(){
    return(
      <tr>
        <td>
          <FormControl value={this.state.name} onChange={this.handleChange('name')}/>
        </td>
        <td>
          <FormControl value={this.state.value} onChange={this.handleChange('value')}/>
        </td>
        <td>
          <Button bsStyle='danger' className='form-control' onClick={this.handleRemove.bind(this)}>
            <Glyphicon glyph='trash' />
          </Button>
        </td>
      </tr>
    );
  }
}

export default class ModalEnv extends React.Component{
  /*
   * state: {
   *   name, values
   * }
   */
  constructor(props){
    super(props);
    this.state = {showModal: false, name: '', values: props.values || []};
  }
  close(){
    this.setState({showModal: false});
  }
  open(){
    this.setState({showModal: true});
  }
  openWith(name, values){
    this.setState({name, values});
    this.open();
  }
  save(){
    const env = JSON.stringify(this.state.values.map(x => [ x.name, x.value ])
      .reduce((p, c) => ((p[c[0]] = c[1]), p), {}));
    Http.post(`/api/services/${this.state.name}/env/update`, {env},
      () => Toast.show('Env updated!', 'success'),
      () => Toast.show('Env update failed', 'warning')
    );
    this.close();
  }
  handleChange(e){
    let values = this.state.values.slice(0);
    values[e.index].name = e.name;
    values[e.index].value = e.value;
    this.setState({values});
  }
  handleRemove(e){
    let values = this.state.values.slice(0);
    values.splice(e.index, 1);
    this.setState({values});
  }
  handleAddRow(){
    let values = this.state.values.slice(0);
    values.push({name:'', value:''});
    this.setState({values});
  }
  render(){
    const fields = this.state.values.map((x, i) => {
      return (<EnvItem key={i} name={x.name} value={x.value} index={i} onChange={this.handleChange.bind(this)} onRemove={this.handleRemove.bind(this)} />);
    });
    return (
      <Modal show={this.state.showModal} onHide={this.close.bind(this)}>
        <Modal.Header>
          <Modal.Title>Env config</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <Table>
              <thead>
                <tr>
                  <th>name</th>
                  <th>value</th>
                </tr>
              </thead>
              <tbody>
                {fields}
                <tr>
                  <td colSpan='3'>
                    <Button onClick={this.handleAddRow.bind(this)} className='form-control'>add new</Button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='primary' onClick={this.save.bind(this)}>save</Button>
          <Button onClick={this.close.bind(this)}>cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
