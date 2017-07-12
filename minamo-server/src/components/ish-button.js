import React from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';

export default class IntegratedShellButton extends React.Component {
  constructor(){
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(){
    if(typeof(this.props.onClick) === 'function'){
      this.props.onClick();
    }
  }
  render(){
    const clazz = this.props.xs ? 'visible-xs' : 'hidden-xs';
    if(!this.context.isAuthenticated) return null;
    return(
      <Button bsStyle='primary' className={`${clazz} ish-button`} onClick={this.handleClick}>
        <Glyphicon glyph='console' />
      </Button>
    );
  }
}
IntegratedShellButton.contextTypes = {
  isAuthenticated: PropTypes.bool
};
