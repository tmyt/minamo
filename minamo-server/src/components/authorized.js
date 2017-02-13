import React from 'react';

export default class Authorized extends React.Component{
  render(){
    return this.props.children;
  }
  static verifyCredentials(nextState, replaceState, callback){
    if(typeof $ !== 'function'){
      // here is server side render
      return callback();
    }
    // here is client side render
    if(window.isVerified){
      // request already verified
      delete window.isVerified;
      return callback();
    }
    const redir = '/login?_redir=' + encodeURIComponent(nextState.location.pathname);
    $.ajax({
      url: '/api/verify'
    }).done(data => {
      if(data.isAuthenticated){ callback(); }
      replaceState(redir);
      callback();
    }).fail(() => {
      replaceState(redir);
      callback();
    });
  }
}
Authorized.contextTypes = {
  isAuthenticated: React.PropTypes.bool
}
