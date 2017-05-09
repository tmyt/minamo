import React from 'react';
import PropTypes from 'prop-types';
import PageRoot from '../components/page-root';
import ExtensionTips from '../components/extension-tips';
import Xterm from '../components/xterm';
import TerminalOpener from '../components/terminal-opener';
import qs from '../lib/querystring';

export default class TerminalComponent extends React.Component{
  constructor(){
    super();
    this.state = {tipsVisible: false, theme: undefined, hasExtension: false};
  }
  componentWillMount(){
    const args = qs(this.context.router.location, ['theme']);
    this.setState(args);
  }
  componentDidMount(){
    this.detectExtension();
  }
  hasExtension(){
    return !!document.getElementsByTagName('meta')['mo:extension-available'];
  }
  detectExtension(){
    if(typeof(chrome) !== 'object'){ return; }
    const available = this.hasExtension();
    this.setState({tipsVisible: !available, hasExtension: available});
  }
  render(){
    return (
      <PageRoot title='terminal'>
        <ExtensionTips visible={this.state.tipsVisible}/>
        <h2>Terminal</h2>
        <Xterm theme={this.state.theme}>
          <TerminalOpener theme={this.state.theme} hasExtension={this.state.hasExtension}/>
        </Xterm>
      </PageRoot>
    );
  }
}
TerminalComponent.contextTypes = {
  router: PropTypes.object
};
