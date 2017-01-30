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
    return {setTabbar: this.setTabbar.bind(this)}
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
AppComponent.childContextTypes = {
  setTabbar: React.PropTypes.func
};
