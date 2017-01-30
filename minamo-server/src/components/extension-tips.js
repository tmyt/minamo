import React from 'react';
import { Alert } from 'react-bootstrap';

const CrxPath = 'https://chrome.google.com/webstore/detail/ppdhipnblajeianfgkcbneadiebfkped/';

export default class ExtensionTipsComponent extends React.Component{
  constructor(props){
    super(props);
    this.state = {visible: !!this.props.visible};
  }
  componentWillReceiveProps(nextProps){
    this.setState({visible: !!nextProps.visible});
  }
  handleDismiss(){
    this.setState({visible: false});
  }
  show(){
    this.setState({visible: true});
  }
  render(){
    if(!this.state.visible) return null;
    return(
      <Alert bsStyle="info" onDismiss={this.handleDismiss.bind(this)}>
        <strong>Tips</strong> <a href={CrxPath} className='alert-link' target='_blank'>minamo.io Terminal Extension</a> more better terminal experience!
      </Alert>
    );
  }
}
