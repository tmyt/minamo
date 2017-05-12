import React from 'react';
import PropTypes from 'prop-types';
import Xterm from '../components/xterm';
import DocumentTitle from 'react-document-title';
import qs from '../lib/querystring';

export default class PopupTerminalComponent extends React.Component{
  constructor(){
    super();
    this.state = { theme: undefined };
    this.handleTitleChange = this.handleTitleChange.bind(this);
  }
  componentWillMount(){
    const args = qs(this.context.router.location.search, ['theme']);
    this.setState(args);
  }
  componentDidMount(){
    this.titleElement = window.parent.document.getElementById('ish-title');
  }
  handleTitleChange(title){
    if(this.titleElement) this.titleElement.innerText = title;
  }
  render(){
    return (
      <DocumentTitle title='terminal'>
        <Xterm className='popup' isExported={true} theme={this.state.theme} onChangeTitle={this.handleTitleChange}/>
      </DocumentTitle>
    );
  }
}
PopupTerminalComponent.contextTypes = {
  router: PropTypes.object
};

