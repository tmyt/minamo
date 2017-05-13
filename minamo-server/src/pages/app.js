import React from 'react';
import PropTypes from 'prop-types';

import HeaderComponent from '../components/header';
import FooterComponent from '../components/footer';
import IntegratedShell from '../components/ish';

export default class AppComponent extends React.Component {
  constructor(){
    super();
    this.state = {viewSize: '', isISHVisible: false};
    this.handleResize = this.handleResize.bind(this);
    this.handleLaunchISH = this.handleLaunchISH.bind(this);
    this.handleCloseISH = this.handleCloseISH.bind(this);
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
      viewSize: this.state.viewSize,
    };
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
  handleLaunchISH(){
    this.setState({isISHVisible: true});
  }
  handleCloseISH(){
    this.setState({isISHVisible: false});
  }
  render(){
    return (
      <div className='flexbox'>
        <div className='flex-main'>
          <HeaderComponent onLaunchISH={this.handleLaunchISH}/>
          <div id='main'>
            {this.props.children}
          </div>
          <FooterComponent />
        </div>
        <IntegratedShell visible={this.state.isISHVisible} onCloseISH={this.handleCloseISH}/>
      </div>
    );
  }
}
AppComponent.childContextTypes = {
  viewSize: PropTypes.string,
};
