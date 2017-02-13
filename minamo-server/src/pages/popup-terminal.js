import React from 'react';
import qs from 'qs';
import Xterm from '../components/xterm';

export default class PopupTerminalComponent extends React.Component{
  constructor(){
    super();
    this.state = { theme: undefined };
  }
  componentWillMount(){
    const search = this.context.router.location.search;
    if(search[0] !== '?'){ return; }
    const args = qs.parse(search.substring(1));
    this.setState({theme: args.theme});
  }
  render(){
    return (
      <Xterm className='popup' isExported={true} theme={this.state.theme} />
    );
  }
}
PopupTerminalComponent.contextTypes = {
  router: React.PropTypes.object
};
