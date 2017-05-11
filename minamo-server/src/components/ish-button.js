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
    const styles = {
      margin: '20px 15px',
      position: 'relative',
      float: this.props.xs ? 'right' : 'left',
      border: 'solid 1px #1a252f',
      color: '#888',
    };
    return(
      <Button bsStyle='primary' style={styles} className={this.props.xs ? 'visible-xs' : 'hidden-xs'} onClick={this.handleClick}>
        <Glyphicon glyph='console' />
      </Button>
    );
  }
}
