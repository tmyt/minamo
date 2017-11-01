import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import Avatar from './avatar';
import Container from './container';
import Hamburger from './hamburger';
import ConsoleTabs from './console/tabs';
import IntegratedShellButton from './ish-button';
import isActive from '../lib/isactive';

export default class HeaderComponent extends React.Component {
  constructor(){
    super();
    this.onSelect = this.onSelect.bind(this);
    this.onClickISH = this.onClickISH.bind(this);
  }
  onSelect(){
    const display = window.getComputedStyle(this.expandButton).display;
    if(display === 'none') return;
    if(this.navMain.className.indexOf('in') >= 0) return;
    this.expandButton.click();
  }
  onClickISH(){
    if(typeof(this.props.onLaunchISH) === 'function'){
      this.props.onLaunchISH();
    }
  }
  render(){
    let extraTabMenu = null;
    let adminTabItem = null;
    if(this.context.router && isActive(this.context.router, '/console', true)){
      extraTabMenu = (<ConsoleTabs />);
    }
    if(this.context.profile && this.context.profile.role === 'admin'){
      adminTabItem = (<LinkContainer to='/admin'><NavItem>admin</NavItem></LinkContainer>);
    }
    return (
      <header className={extraTabMenu ? 'has-tabbar' : ''}>
        <div className='navbar navbar-default navbar-static-top' id='header_nav'>
          <Container>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to='/'>minamo.io</Link>
              </Navbar.Brand>
              <button className='navbar-toggle collapsed' type='button' data-toggle='collapse' data-target='#navbar-main' ref={e=>this.expandButton = e}>
                <Hamburger />
              </button>
              <IntegratedShellButton xs={true} onClick={this.onClickISH}/>
            </Navbar.Header>
            <Navbar.Collapse id='navbar-main'>
              <div className='nav navbar-right' ref={e=>this.navMain=e}>
                <IntegratedShellButton onClick={this.onClickISH}/>
                <Avatar visible={this.context.isAuthenticated}/>
              </div>
              <Nav navbar={true} onSelect={this.onSelect}>
                <LinkContainer to='/console' exact={true}><NavItem>console</NavItem></LinkContainer>
                <LinkContainer to='/console/logstream'><NavItem>log stream</NavItem></LinkContainer>
                <LinkContainer to='/console/sysinfo'><NavItem>sysinfo</NavItem></LinkContainer>
                {adminTabItem}
              </Nav>
            </Navbar.Collapse>
          </Container>
          {extraTabMenu}
        </div>
      </header>
    );
  }
}
HeaderComponent.contextTypes = {
  router: PropTypes.object,
  isAuthenticated: PropTypes.bool,
  profile: PropTypes.object,
};
