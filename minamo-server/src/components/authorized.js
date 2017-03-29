import React from 'react';

export default class Authorized extends React.Component{
  render(){
    return this.props.children;
  }
  static verifyCore(isAdmin, nextState, replaceState, callback){
    if(typeof $ !== 'function'){
      // here is server side render
      return callback();
    }
    // here is client side render
    if(Authorized.IsFirstTime){
      // at the first time, all page content is rendered
      // by server-side. request already verified by the server.
      Authorized.IsFirstTime = false;
      return callback();
    }
    const redir = '/login?_redir=' + encodeURIComponent(nextState.location.pathname);
    $.ajax({
      url: `/api/${isAdmin ? 'admin/' : ''}verify`
    }).done(data => {
      if(data.isAuthenticated){ callback(); }
      replaceState(redir);
      callback();
    }).fail(() => {
      replaceState(redir);
      callback();
    });
  }
  static verifyCredentials(nextState, replaceState, callback){
    Authorized.verifyCore(false, nextState, replaceState, callback);
  }
  static verifyAdminCredentials(nextState, replaceState, callback){
    Authorized.verifyCore(true, nextState, replaceState, callback);
  }
}
Authorized.contextTypes = {
  isAuthenticated: React.PropTypes.bool
}
Authorized.IsFirstTime = true;
