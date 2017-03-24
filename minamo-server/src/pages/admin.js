import React from 'react';
import { Table, DropdownButton, Button, MenuItem, FormGroup, FormControl } from 'react-bootstrap';

import PageRoot from '../components/page-root';
import Http from '../components/console/http-verb';
import Toast from '../components/toast';

class UserListRow extends React.Component{
  constructor(){
    super();
    this.handleSelect = this.handleSelect.bind(this);
    this.handleResetPassword = this.handleResetPassword.bind(this);
    this.handleDeleteUser = this.handleDeleteUser.bind(this);
    this.state = {password: ''};
  }
  componentWillMount(){
    this.setState({password: this.props.password});
  }
  handleSelect(key, e){
    key();
  } 
  handleResetPassword(){
    Http.post('/api/users/reset_password', {username: this.props.username},
      (ret) => {
        Toast.show('Password reset complete', 'success');
        this.setState({password: ret});
      },
      () => Toast.show('Password reset failed', 'error')
    )
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
  render(){
    return(
      <tr>
        <td>{this.props.username}</td>
        <td>{this.state.password || '●●●●●●●●'}</td>
        <td>{this.props.role}</td>
        <td>
          <DropdownButton bsStyle='primary' title='action' onSelect={this.handleSelect} id='user-action'>
            <MenuItem eventKey={this.handleResetPassword}>reset password</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={this.handleDeleteUser}>delete user</MenuItem>
          </DropdownButton>
        </td>
      </tr>
    );
  }
}

class UserListNewUserRow extends React.Component{
  constructor(){
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {username: '', pending: false, available: false};
  }
  handleChange(e){
    clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      Http.get('/api/users/exists', {username: this.state.username},
        () => this.setState({pending: false, available: false}),
        () => this.setState({pending: false, available: true})
      );
    }, 500);
    this.setState({pending: true, username: e.target.value});
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
        this.props.onCreate({username, password: ret});
      },
      () => Toast.show('User create failed', 'error')
    );
  }
  validate(){
    if(this.state.username.length === 0) return null;
    return this.state.username.length >= 3 && (this.state.pending || this.state.available)
      ? 'success' : 'error';
  }
  render(){
    return(
      <tr>
        <td>
          <FormGroup validationState={this.validate()}>
            <FormControl type='text' placeholder='new username' value={this.state.username} onChange={this.handleChange}/>
            <FormControl.Feedback />
          </FormGroup>
        </td>
        <td><FormControl value='●●●●●●●●' disabled/></td>
        <td><FormControl value='user' disabled/></td>
        <td><Button bsStyle='success' disabled={this.validate() !== 'success'} onClick={this.handleClick}>create</Button></td>
      </tr>
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
      (ret) =>  this.setState({users: ret}),
      () => {}
    );
  }
  handleCreate(newUser){
    this.setState({users: this.state.users.concat([newUser])});
  }
  handleDelete(username){
    this.setState({users: this.state.users.filter(x => x.username !== username)});
  }
  render(){
    const users = this.state.users.map(u => (
      <UserListRow username={u.username} password={u.password} role={u.role} key={u.username} onDelete={this.handleDelete}/>
    ));
    return(
      <Table hover>
        <thead>
          <tr>
            <th>username</th>
            <th>password</th>
            <th>role</th>
          </tr>
        </thead>
        <tbody>
          {users}
          <UserListNewUserRow onCreate={this.handleCreate}/>
        </tbody>
      </Table>
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
