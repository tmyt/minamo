import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import FontAwesome from './font-awesome';

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
    const clazz = this.props.xs ? 'd-inline d-md-none' : 'd-none d-md-inline';
    if(!this.context.isAuthenticated) return null;
    return(
      <Button variant='primary' className={`${clazz} ish-button`} onClick={this.handleClick}>
        <FontAwesome icon='terminal' />
      </Button>
    );
  }
}
IntegratedShellButton.contextTypes = {
  isAuthenticated: PropTypes.bool
};
