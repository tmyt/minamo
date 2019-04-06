import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

class NotFound extends React.Component{
  render(){
    if(this.props.staticContext){
      this.props.staticContext.status = 404;
      return null;
    }
    return <p>Not Found</p>;
  }
}

export default withRouter(NotFound);
