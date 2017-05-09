import React from 'react';

class UserAvatar extends React.Component{
  render(){
    return (
      <div className={`navbar-text ${this.props.className || ''}`}>
        <img className='profile-image img-circle' src={this.context.profile.avatar} width='40' height='40' />
      </div>
    );
  }
}
UserAvatar.contextTypes = {
  profile: React.PropTypes.object
};

class UserAvatarXs extends React.Component{
  render(){
    return (
      <div className={`navbar-text ${this.props.className || ''}`}>
        <img className='profile-image-xs img-circle' src={this.context.profile.avatar} width='28' height='28' />
        <a>{this.context.profile.username}</a>
      </div>
    );
  }
}
UserAvatarXs.contextTypes = {
  profile: React.PropTypes.object
};

export default class UserAvatarComponent extends React.Component{
  render(){
    if(!this.props.visible) return null;
    if(this.context.viewSize === ''){
      return (
        <div>
          <UserAvatar className='hidden-xs'/>
          <UserAvatarXs className='visible-xs'/>
        </div>
      );
    }
    return this.context.viewSize === 'xs'
      ? <UserAvatarXs />
      : <UserAvatar />;
  }
}
UserAvatarComponent.contextTypes = {
  viewSize: React.PropTypes.string,
};
