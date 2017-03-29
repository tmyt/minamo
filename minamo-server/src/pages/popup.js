import React from 'react';
import Meta from '../components/meta';

export default class PopupComponent extends React.Component {
  constructor(){
    super();
  }
  getAuthInfo(){
    const {user: username = '', role = '', avatar = ''} = Meta;
    const profile = {username, role, avatar};
    return {isAuthenticated: !!username, profile};
  }
  getChildContext(){
    const auth = typeof window === 'object'
      ? this.getAuthInfo() : this.context.router.auth;
    return {
      isAuthenticated: auth.isAuthenticated,
      profile: auth.profile || {avater:'', username: '', role: ''}
    };
  }
  render(){
    return this.props.children;
  }
}
PopupComponent.contextTypes = {
  router: React.PropTypes.object
};
PopupComponent.childContextTypes = {
  isAuthenticated: React.PropTypes.bool,
  profile: React.PropTypes.object,
};
