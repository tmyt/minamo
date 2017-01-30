import React from 'react';

export default class Authorized extends React.Component{
  render(){
    return this.props.children;
  }
  static verifyCredentials(nextState, replaceState, callback){
    if(typeof $ !== 'function'){
      // here is server side render
      callback();
      return;
    }
    // here is client side render
    $.ajax({
      url: '/api/verify'
    }).done(data => {
      if(data.isAuthenticated){ callback(); }
      replaceState('/login');
      callback();
    }).fail(() => {
      replaceState('/login');
      callback();
    });
  }
}
