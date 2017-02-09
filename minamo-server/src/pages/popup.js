import React from 'react';

export default class PopupComponent extends React.Component {
  constructor(){
    super();
  }
  getChildContext(){
    const auth = typeof window === 'object'
      ? window.APP_PROPS : this.context.router.auth;
    return {
      isAuthenticated: auth.isAuthenticated,
      profile: auth.profile || {avater:'', username: ''}
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
