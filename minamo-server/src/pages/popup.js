import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import Meta from '../components/meta';

class PopupComponent extends React.Component {
  constructor(){
    super();
  }
  getProfileInfo(){
    const {user: username = '', role = '', avatar = ''} = Meta;
    return {username, role, avatar};
  }
  getChildContext(){
    const profile = (typeof window === 'object'
      ? this.getProfileInfo() : this.props.staticContext.profile)
      || {username: '', avatar: '', role: ''};
    return {
      isAuthenticated: !!(profile && profile.username), profile
    };
  }
  render(){
    return this.props.children;
  }
}
PopupComponent.childContextTypes = {
  isAuthenticated: PropTypes.bool,
  profile: PropTypes.object,
};

export default withRouter(PopupComponent);
