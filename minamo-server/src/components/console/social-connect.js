import React from 'react';
import { Button } from 'react-bootstrap';
import Http from './http-verb';

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
    const label = (this.state.connected ? 'Disconnect from ' : 'Connect to ') + this.props.label;
    const style = this.state.connected ? 'danger' : 'primary';
    return(
      <Button bsStyle={style} onClick={this.handleClick}>{label}</Button>
    );
  }
}

export default class SocialConnect extends React.Component{
  constructor(){
    super();
    this.state = {twitter: false, github: false, loaded: false};
  }
  componentDidMount(){
    Http.get('/api/credentials/connected', {},
      ret => this.setState({
        loaded: true, twitter: ret.twitter, github: ret.github
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
        <SocialConnectButton connected={this.state.twitter} service='twitter' label='Twitter'/>
        <SocialConnectButton style={{marginLeft: '8px'}} connected={this.state.github} service='github' label='GitHub'/>
      </div>
    );
  }
}
