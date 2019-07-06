import React from 'react';
import { Button, Form } from 'react-bootstrap';
import Http from './http-verb';
import FontAwesome from '../font-awesome';

class SocialConnectButton extends React.Component{
  constructor(){
    super();
    this.state = {connected: false};
    this.handleClick = this.handleClick.bind(this);
  }
  componentWillMount(){
    this.setState({connected: this.props.connected});
  }
  componentWillReceiveProps(newProps){
    this.setState({connected: newProps.connected});
  }
  handleClick(){
    if(this.state.connected){
      if(confirm(`Disconnect from ${this.props.label}?`)){
        Http.post(`/api/credentials/${this.props.service}/disconnect`, {},
          () => this.setState({connected: false}),
          () => {}
        );
      }
    }else{
      location.href = `/api/credentials/${this.props.service}/connect`;
    }
  }
  render(){
    const label = this.state.connected ? 'disconnect' : 'connect';
    const style = this.state.connected ? 'warning' : 'primary';
    return(
      <Form.Group>
        <Button variant={style} onClick={this.handleClick} className='social-connect'>
          {this.props.children}
          <span>{label}</span>
        </Button>
      </Form.Group>
    );
  }
}

export default class SocialConnect extends React.Component{
  constructor(){
    super();
    this.state = {github: false, loaded: false};
  }
  componentDidMount(){
    Http.get('/api/credentials/connected', {},
      ret => this.setState({
        loaded: true, github: ret.github
      }),
      e => this.setState({ loaded: true, error: `Error: ${e}` })
    );
  }
  render(){
    if(!this.state.loaded){
      return (<div>Loading...</div>);
    }
    if(this.state.error){
      return (<div>{this.state.error}</div>);
    }
    return(
      <div>
        <SocialConnectButton connected={this.state.github} service='github'>
          <FontAwesome icon='github' />
        </SocialConnectButton>
      </div>
    );
  }
}
