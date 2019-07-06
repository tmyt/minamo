import React from 'react';
import PropTypes from 'prop-types';

class UserAvatar extends React.Component{
  render(){
    return (
      <span className={`${this.props.className || ''}`}>
        <img className='profile-image img-circle' src={this.context.profile.avatar} width='40' height='40' />
      </span>
    );
  }
}
UserAvatar.contextTypes = {
  profile: PropTypes.object
};

class UserAvatarXs extends React.Component{
  render(){
    return (
      <span className={`navbar-text ${this.props.className || ''}`}>
        <img className='profile-image-xs img-circle' src={this.context.profile.avatar} width='28' height='28' />
        <a>{this.context.profile.username}</a>
      </span>
    );
  }
}
UserAvatarXs.contextTypes = {
  profile: PropTypes.object
};

export default class UserAvatarComponent extends React.Component{
  render(){
    if(!this.props.visible) return null;
    if(this.context.viewSize === ''){
      return (
        <span>
          <UserAvatar className='d-none d-md-block'/>
          <UserAvatarXs className='d-block d-md-none'/>
        </span>
      );
    }
    return this.context.viewSize === 'xs' || this.context.viewSize === 'sm'
      ? <UserAvatarXs />
      : <UserAvatar />;
  }
}
UserAvatarComponent.contextTypes = {
  viewSize: PropTypes.string,
};
