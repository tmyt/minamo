import React from 'react';
import PropTypes from 'prop-types';
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
    const profile = (typeof window === 'object'
      ? this.getProfileInfo() : this.context.router.staticContext.profile)
      || {username: '', avatar: '', role: ''};
    return {
      isAuthenticated: !!(profile && profile.username), profile
    };
  }
  render(){
    return this.props.children;
  }
}
PopupComponent.contextTypes = {
  router: PropTypes.object
};
PopupComponent.childContextTypes = {
  isAuthenticated: PropTypes.bool,
  profile: PropTypes.object,
};
