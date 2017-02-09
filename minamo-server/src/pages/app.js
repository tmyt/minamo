import React from 'react';

import HeaderComponent from '../components/header';
import FooterComponent from '../components/footer';

export default class AppComponent extends React.Component {
  constructor(){
    super();
    this.state = {tabbar: null, viewSize: ''};
    this.handleResize = this.handleResize.bind(this);
  }
  componentDidMount(){
    // initialize media query
    this.mqLg = window.matchMedia('(min-width: 1200px)');
    this.mqMd = window.matchMedia('(min-width: 992px)');
    this.mqSm = window.matchMedia('(min-width: 768px)');
    this.handleResize();
    // handle events
    window.addEventListener('resize', this.handleResize);
    // congirue toastr
    toastr.options.closeButton = true;
    toastr.options.progressBar = true;
  }
  componentWillUnmount(){
    window.removeEventListener('resize', this.handleResize);
  }
  getChildContext(){
    return {
      setTabbar: this.setTabbar.bind(this),
      viewSize: this.state.viewSize,
    };
  }
  setTabbar(tabbar){
    this.setState({tabbar});
  }
  handleResize(){
    let newSize = 'xs';
    if(this.mqLg.matches){
      newSize = 'lg';
    }else if(this.mqMd.matches){
      newSize = 'md';
    }else if(this.mqSm.matches){
      newSize = 'sm';
    }
    if(this.state.viewSize !== newSize){
      this.setState({viewSize: newSize});
    }
  }
  render(){
    return (
      <div>
        <HeaderComponent tabs={this.state.tabbar} />
        <div style={{marginBottom: '60px'}}>
          {this.props.children}
        </div>
        <FooterComponent />
      </div>
    );
  }
}
AppComponent.childContextTypes = {
  setTabbar: React.PropTypes.func,
  viewSize: React.PropTypes.string,
};
