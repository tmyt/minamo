import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

export default class IntegratedShellButton extends React.Component {
  render(){
    const styles = {
      margin: '20px 15px',
      position: 'relative',
      float: this.props.xs ? 'right' : 'left',
      border: 'solid 1px #1a252f',
      color: '#888',
    };
    return(
      <Button bsStyle='primary' style={styles} className={this.props.xs ? 'visible-xs' : 'hidden-xs'}>
        <Glyphicon glyph='console' />
      </Button>
    );
  }
}
