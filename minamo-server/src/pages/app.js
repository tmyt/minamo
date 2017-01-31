import React from 'react';

import HeaderComponent from '../components/header';
import FooterComponent from '../components/footer';

export default class AppComponent extends React.Component {
  constructor(){
    super();
    this.state = {tabbar: null};
  }
  componentDidMount(){
    // congirue toastr
    toastr.options.closeButton = true;
    toastr.options.progressBar = true;
  }
  getChildContext(){
    const auth = typeof window === 'object'
      ? window.APP_PROPS : this.context.router.auth;
    return {
      setTabbar: this.setTabbar.bind(this),
      isAuthenticated: auth.isAuthenticated,
      profile: auth.profile || {avater:'', username: ''}
    };
  }
  setTabbar(tabbar){
    this.setState({tabbar});
  }
  render(){
    return (
      <div>
        <HeaderComponent tabs={this.state.tabbar} />
        {this.props.children}
        <FooterComponent />
      </div>
    );
  }
}
AppComponent.contextTypes = {
  router: React.PropTypes.object
};
AppComponent.childContextTypes = {
  setTabbar: React.PropTypes.func,
  isAuthenticated: React.PropTypes.bool,
  profile: React.PropTypes.object,
};
