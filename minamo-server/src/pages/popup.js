import React from 'react';
import Meta from '../components/meta';

export default class PopupComponent extends React.Component {
  constructor(){
    super();
  }
  getProfileInfo(){
    const {user: username = '', role = '', avatar = ''} = Meta;
    return {username, role, avatar};
  }
  getChildContext(){
    const profile = typeof window === 'object'
      ? this.getProfileInfo() : this.context.router.profile;
    return {
      isAuthenticated: !!(profile && profile.username),
      profile: profile || {avater:'', username: '', role: ''}
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
