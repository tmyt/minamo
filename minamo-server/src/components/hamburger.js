import React from 'react';

export default class HamburgerComponent extends React.Component {
  render(){
    return (
      <div>
        <span className="icon-bar" />
        <span className="icon-bar" />
        <span className="icon-bar" />
      </div>
    );
  }
}
