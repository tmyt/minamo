import React from 'react';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import Avatar from './avatar';
import Container from './container';
import Hamburger from './hamburger';
import ConsoleTabs from './console/tabs';

export default class HeaderComponent extends React.Component {
  constructor(){
    super();
    this.onSelect = this.onSelect.bind(this);
  }
  onSelect(){
    const display = window.getComputedStyle(this.expandButton).display;
    if(display === 'none') return;
    if(this.navMain.className.indexOf('in') >= 0) return;
    this.expandButton.click();
  }
  render(){
    let extraTabMenu = null;
    let adminTabItem = null;
    if(this.context.router && this.context.router.isActive('/console', true)){
      extraTabMenu = (<ConsoleTabs />);
    }
    if(this.context.profile && this.context.profile.role === 'admin'){
      adminTabItem = (<LinkContainer to='/admin'><NavItem>admin</NavItem></LinkContainer>);
    }
    return (
      <header>
        <div className='navbar navbar-default navbar-static-top' id='header_nav'>
          <Container>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to='/'>minamo.io</Link>
              </Navbar.Brand>
              <button className='navbar-toggle collapsed' type='button' data-toggle='collapse' data-target='#navbar-main' ref={e=>this.expandButton = e}>
                <Hamburger />
              </button>
            </Navbar.Header>
            <Navbar.Collapse id='navbar-main'>
              <div className='nav navbar-right' ref={e=>this.navMain=e}>
                <Avatar visible={this.context.isAuthenticated}/>
              </div>
              <Nav navbar={true} onSelect={this.onSelect}>
                <LinkContainer to='/console' onlyActiveOnIndex={true}><NavItem>console</NavItem></LinkContainer>
                <LinkContainer to='/console/logstream'><NavItem>log stream</NavItem></LinkContainer>
                <LinkContainer to='/console/terminal'><NavItem>terminal</NavItem></LinkContainer>
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
  router: React.PropTypes.object,
  isAuthenticated: React.PropTypes.bool,
  profile: React.PropTypes.object,
}
