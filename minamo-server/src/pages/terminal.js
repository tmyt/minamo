import React from 'react';
import qs from 'qs';
import PageRoot from '../components/page-root';
import ExtensionTips from '../components/extension-tips';
import Xterm from '../components/xterm';
import FontAwesome from '../components/font-awesome';

const BrowserExtensionEvent = 'x-minamo-openterminal';

export default class TerminalComponent extends React.Component{
  constructor(){
    super();
    this.state = {tipsVisible: false, theme: undefined};
  }
  componentWillMount(){
    const search = this.context.router.location.search;
    if(search[0] !== '?'){ return; }
    const args = qs.parse(search.substring(1));
    this.setState({theme: args.theme});
  }
  componentDidMount(){
    setTimeout(() => {
      this.showExtensionTip();
    }, 1000);
  }
  hasExtension(){
    return !!document.getElementsByTagName('meta')['mo:extension-available'];
  }
  showExtensionTip(){
    if(typeof(chrome) === 'object' && !this.hasExtension()){
      this.setState({tipsVisible: true});
    }
  }
  openPopup(){
    const theme = this.state.theme ? '?theme=' + this.state.theme : '';
    const path = '/console/terminal_popup' + theme;
    if(this.hasExtension()){
      const url = location.protocol + '//' + location.host + path;
      const e = new CustomEvent(BrowserExtensionEvent, { detail: { url } });
      return window.dispatchEvent(e);
    }
    const popupWindowFeatures = 'width=800,height=480,resizable=yes';
    window.open(path, `terminal-${Date.now()}`, popupWindowFeatures);
  }
  render(){
    return (
      <PageRoot title='terminal'>
        <ExtensionTips visible={this.state.tipsVisible}/>
        <h2>Terminal</h2>
        <Xterm theme={this.state.theme}>
          <button onClick={this.openPopup.bind(this)} className='external-button'>
            <FontAwesome icon='external-link' />
          </button>
        </Xterm>
      </PageRoot>
    );
  }
}
TerminalComponent.contextTypes = {
  router: React.PropTypes.object
};
