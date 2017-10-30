import React from 'react';
import PropTypes from 'prop-types';

export default class ActiveEventHandler extends React.Component{
  constructor(){
    super();
    this.installed = false;
  }
  componentDidMount(){
    const e = this._reactInternalFiber.return.stateNode;
    if(!e) return;
    this.installed = true;
    e.addEventListener(this.props.event, this.props.handler, {passive: false});
  }
  componentWillUnmount(){
    const e = this._reactInternalFiber.return.stateNode;
    if(!e || !this.installed) return;
    this.installed = false;
    e.removeEventListener(this.props.event, this.props.handler);
  }
  render(){
    return null;
  }
}
ActiveEventHandler.propTypes = {
  event: PropTypes.string.isRequired,
  handler: PropTypes.func.isRequired,
};
