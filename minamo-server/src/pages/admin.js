import React from 'react';
import { Modal, Card, Table, Dropdown, DropdownButton, Button, Form, FormGroup, FormControl, InputGroup } from 'react-bootstrap';
import FontAwesome from '../components/font-awesome';

import PageRoot from '../components/page-root';
import Http from '../components/console/http-verb';
import Toast from '../components/toast';

const PasswordMask = '●●●●●●●●';

class UserListRowBase extends React.Component{
  constructor(){
    super();
    this.handleSelect = this.handleSelect.bind(this);
    this.handleResetPassword = this.handleResetPassword.bind(this);
    this.handleDeleteUser = this.handleDeleteUser.bind(this);
    this.state = {password: ''};
  }
  componentWillMount(){
    this.setState({password: this.props.password, role: this.props.role});
  }
  handleSelect(key){
    switch(key){
      case 'reset': return this.handleResetPassword();
      case 'delete': return this.handleDeleteUser();
    }
  } 
  handleResetPassword(){
    Http.post('/api/users/reset_password', {username: this.props.username},
      (ret) => {
        Toast.show('Password reset complete', 'success');
        this.setState({password: ret});
      },
      () => Toast.show('Password reset failed', 'error')
    );
  }
  handleDeleteUser(){
    if(!confirm(`Delete user '${this.props.username}' ?`)){
      return;
    }
    Http.post('/api/users/delete', {username: this.props.username},
      () => {
        Toast.show(`User '${this.props.username}' deleted`, 'success');
        if(typeof(this.props.onDelete) === 'function'){
          this.props.onDelete(this.props.username);
        }
      },
      () => Toast.show('User delete failed', 'error')
    );
  }
  handleChangeRoleFor(role){
    Http.post('/api/users/role', {username: this.props.username, role},
      () => {
        this.setState({role});
        Toast.show('User role updated', 'success');
      },
      () => Toast.show('Faild to change role', 'error')
    );
  }
  getPassword(){
    return this.state.password || PasswordMask;
  }
  getRoleView(){
    return(
      <InputGroup>
        <Form.Control as='select' defaultValue={this.state.role} onChange={e => this.handleChangeRoleFor(e.target.value)}>
          <option value='admin'>admin</option>
          <option value='user'>user</option>
        </Form.Control>
      </InputGroup>
    );
  }
  getActionView(){
    return(
      <DropdownButton variant='primary' title='action' onSelect={this.handleSelect} id='user-action'>
        <Dropdown.Item eventKey='reset'>reset password</Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item eventKey='delete'>delete user</Dropdown.Item>
      </DropdownButton>
    );
  }
}

class UserListRow extends UserListRowBase{
  render(){
    return(
      <tr>
        <td>{this.props.username}</td>
        <td>{this.getPassword()}</td>
        <td>{this.getRoleView()}</td>
        <td>{this.getActionView()}</td>
      </tr>
    );
  }
}

class UserListPanel extends UserListRowBase{
  render(){
    return(
      <Card>
        <Card.Body>
          <dl className='dl-horizontal'>
            <dt>username</dt>
            <dd><span>{this.props.username}</span></dd>
            <dt>password</dt>
            <dd><span>{this.getPassword()}</span></dd>
            <dt>role</dt>
            <dd><span>{this.getRoleView()}</span></dd>
          </dl>
          {this.getActionView()}
        </Card.Body>
      </Card>
    );
  }
}

class UserListNewUserRowBase extends React.Component{
  constructor(){
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {username: '', pending: true, available: false};
  }
  handleChange(e){
    clearTimeout(this.timerId);
    this.setState({username: e.target.value});
    if(!e.target.value || e.target.value.length < 3){
      this.setState({pending: !e.target.value, available: false});
      return;
    }
    this.timerId = setTimeout(() => {
      Http.get('/api/users/exists', {username: this.state.username},
        () => this.setState({pending: false, available: false}),
        () => this.setState({pending: false, available: true})
      );
    }, 500);
    this.setState({pending: true});
  }
  handleClick(){
    const username = this.state.username;
    this.setState({username: ''});
    if(typeof(this.props.onCreate) !== 'function'){
      return;
    }
    Http.post('/api/users/create', {username},
      (ret) => {
        Toast.show('User created', 'success');
        this.props.onCreate({username, password: ret, role: 'user'});
      },
      () => Toast.show('User create failed', 'error')
    );
  }
  validate(){
    if(this.state.username.length === 0) return null;
    if(this.state.pending) return 'warning';
    return this.state.username.length >= 3 && this.state.available ? 'success' : 'error';
  }
  getUserNameView(){
    const props = {};
    if(!this.state.pending){
      if(this.state.available) props.isValid = true; else props.isInvalid = true;
    }
    return(
      <Form noValidate>
        <FormGroup>
          <FormControl type='text' placeholder='new username' value={this.state.username} onChange={this.handleChange} {...props} />
        </FormGroup>
      </Form>
    );
  }
}

class UserListNewUserRow extends UserListNewUserRowBase{
  render(){
    return(
      <tr>
        <td>{this.getUserNameView()}</td>
        <td><FormControl value={PasswordMask} disabled/></td>
        <td><FormControl value='user' disabled/></td>
        <td><Button variant='success' disabled={this.validate() !== 'success'} onClick={this.handleClick}>create</Button></td>
      </tr>
    );
  }
}

class UserListNewUserModal extends UserListNewUserRowBase{
  constructor(){
    super();
    this.state.show = false;
  }
  componentWillReceiveProps(newProps){
    this.setState({show: newProps.show});
  }
  close(){
    this.setState({show: false, username: ''});
  }
  render(){
    return(
      <div>
        <Button variant='info' onClick={()=>this.setState({show:true})} className='button-mobile-primary-action'>
          <FontAwesome icon='plus' />
        </Button>
        <Modal show={this.state.show} onHide={this.close.bind(this)}>
          <Modal.Header>
            <Modal.Title>Add New user</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <dl>
              <dt>username</dt>
              <dd>{this.getUserNameView()}</dd>
              <dt>password</dt>
              <dd><FormGroup><FormControl value={PasswordMask} disabled/></FormGroup></dd>
              <dt>role</dt>
              <dd><FormGroup><FormControl value='user' disabled/></FormGroup>
              </dd>
            </dl>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='success' disabled={this.validate() !== 'success'} onClick={this.handleClick}>create</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

class UserList extends React.Component{
  constructor(){
    super();
    this.handleCreate = this.handleCreate.bind(this);
    this.handleDelete =this.handleDelete.bind(this);
    this.state = {users: []};
  }
  componentDidMount(){
    Http.get('/api/users', {},
      (ret) =>  this.setState({users: ret}), () => {}
    );
  }
  handleCreate(newUser){
    this.setState({users: this.state.users.concat([newUser])});
  }
  handleDelete(username){
    this.setState({users: this.state.users.filter(x => x.username !== username)});
  }
  render(){
    return (
      <div id='admin'>
        <div className='d-none d-md-block'>
          <Table hover>
            <thead>
              <tr>
                <th>username</th>
                <th>password</th>
                <th>role</th>
              </tr>
            </thead>
            <tbody>
              {this.state.users.map(u => (
                <UserListRow username={u.username} password={u.password} role={u.role} key={u.username} onDelete={this.handleDelete}/>
              ))}
              <UserListNewUserRow onCreate={this.handleCreate}/>
            </tbody>
          </Table>
        </div>
        <div className='d-block d-md-none'>
          {this.state.users.map(u => (
            <UserListPanel username={u.username} password={u.password} role={u.role} key={u.username} onDelete={this.handleDelete}/>
          ))}
          <UserListNewUserModal onCreate={this.handleCreate}/>
        </div>
      </div>
    );
  }
}

export default class AdminPageComponent extends React.Component{
  render(){
    return(
      <PageRoot title='admin'>
        <h2>admin</h2>
        <h3>users</h3>
        <UserList />
      </PageRoot>
    );
  }
}
