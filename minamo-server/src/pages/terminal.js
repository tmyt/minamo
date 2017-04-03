import React from 'react';
import qs from 'qs';
import PageRoot from '../components/page-root';
import ExtensionTips from '../components/extension-tips';
import Xterm from '../components/xterm';
import FontAwesome from '../components/font-awesome';
import TerminalOpener from '../components/terminal-opener';

const BrowserExtensionEvent = 'x-minamo-openterminal';

export default class TerminalComponent extends React.Component{
  constructor(){
    super();
    this.state = {tipsVisible: false, theme: undefined, hasExtension: false};
  }
  componentWillMount(){
    const search = this.context.router.location.search;
    if(search[0] !== '?'){ return; }
    const args = qs.parse(search.substring(1));
    this.setState({theme: args.theme});
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
  router: React.PropTypes.object
};
