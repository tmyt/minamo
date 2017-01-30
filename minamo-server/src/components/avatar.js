import React from 'react';

export default class UserAvatarComponent extends React.Component{
  render(){
    return (
      <div>
        <div className='navbar-text hidden-xs'>
          <img className='profile-image img-circle' src={this.props.src} width='40' height='40' />
        </div>
        <div className='navbar-text visible-xs'>
          <img className='profile-image-xs img-circle' src={this.props.src} width='28' height='28' />
          <a>{this.props.name}</a>
        </div>
      </div>
    );
  }
}
