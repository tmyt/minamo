import React from 'react';
import PageRoot from '../components/page-root';
import ExtensionTips from '../components/extension-tips';
import Xterm from '../components/xterm';
import FontAwesome from '../components/font-awesome';

export default class TerminalComponent extends React.Component{
  constructor(){
    super();
    this.state = {tipsVisible: false};
  }
  componentDidMount(){
    setTimeout(() => {
      this.checkExtensionAvailability();
    }, 1000);
  }
  checkExtensionAvailability(){
    if(typeof(chrome) === 'object' && !document.getElementById('x-minamo-openterminal-extension')){
      this.setState({tipsVisible: true});
    }
  }
  openPopup(){
    const popupWindowFeatures = {
      width: 800,
      height: 480,
      menubar: 'no',
      toolbar: 'no',
      location: 'no',
      directories: 'no',
      personalbar: 'no',
      status: 'no',
      resizable: 'yes',
      scrollbars: 'no',
    };
    const features = Object.keys(popupWindowFeatures).map(x => `${x}=${popupWindowFeatures[x]}`).join(',');
    if(document.getElementById('x-minamo-openterminal-extension')){
      let e = new CustomEvent('x-minamo-openterminal', {detail: { url: location.protocol + location.host + '/console/terminal_popup'}});
      window.dispatchEvent(e);
      return;
    }
    window.open('/console/terminal_popup', `terminal-${Date.now()}`, features);
  }
  render(){
    return (
      <PageRoot title='terminal'>
        <ExtensionTips visible={this.state.tipsVisible}/>
        <h2>Terminal</h2>
        <Xterm>
          <button onClick={this.openPopup} className='external-button'>
            <FontAwesome icon='external-link' />
          </button>
        </Xterm>
      </PageRoot>
    );
  }
}
