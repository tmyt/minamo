import React from 'react';
import PropTypes from 'prop-types';

export default class NotFound extends React.Component{
  render(){
    if(this.context.router.staticContext){
      this.context.router.staticContext.status = 404;
      return null;
    }
    return <p>Not Found</p>;
  }
}
NotFound.contextTypes = {
  router: PropTypes.object,
};
