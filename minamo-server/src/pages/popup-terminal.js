import React from 'react';
import Xterm from '../components/xterm';

export default class PopupTerminalComponent extends React.Component{
  render(){
    return (
      <Xterm className='popup'/>
    );
  }
}
