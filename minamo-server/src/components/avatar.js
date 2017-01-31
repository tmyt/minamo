import React from 'react';

export default class UserAvatarComponent extends React.Component{
  render(){
    const profile = this.context.profile;
    if(!this.props.visible) return null;
    return (
      <div>
        <div className='navbar-text hidden-xs'>
          <img className='profile-image img-circle' src={this.context.profile.avatar} width='40' height='40' />
        </div>
        <div className='navbar-text visible-xs'>
          <img className='profile-image-xs img-circle' src={this.context.profile.avatar} width='28' height='28' />
          <a>{this.context.profile.username}</a>
        </div>
      </div>
    );
  }
}
UserAvatarComponent.contextTypes = {
  profile: React.PropTypes.object
}
