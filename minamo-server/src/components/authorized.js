import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import Meta from './meta';

export default class Authorized extends React.Component{
  constructor(){
    super();
    this.state = { initialized: false, authorized: false, redirect: undefined };
  }
  componentWillMount(){
    if(this.context.router.staticContext){
      this.context.router.staticContext.authorizationRequired = true;
    }
  }
  componentDidMount(){
    if(Meta.authorized){
      delete Meta.authorized;
      this.setState({ initialized: true, authorized: true });
      return;
    }
    const redir = '/login?_redir=' + encodeURIComponent(this.context.router.route.location.pathname);
    $.ajax({
      url: `/api/${this.props.isAdmin ? 'admin/' : ''}verify`
    }).done(data => {
      if(data.isAuthenticated){
        this.setState({ initialized: true, authorized: true });
      }else{
        this.setState({ initialized: true, authorized: false, redirect: redir });
      }
    }).fail(() => {
      this.setState({ initialized: true, authorized: false, redirect: redir });
    });
  }
  render(){
    if(this.context.router.staticContext){
      // here is server side render
      return this.props.children;
    }
    // here is client side render
    if(!this.state.initialized) return null;
    if(this.state.authorized && Meta.user && (!this.props.isAdmin || (Meta.role === 'admin'))){
      // at the first time, all page content is rendered
      // by server-side. request already verified by the server.
      return this.props.children;
    }
    return <Redirect to={this.state.redirect} />;
  }
}
Authorized.contextTypes = {
  router: PropTypes.object,
};
