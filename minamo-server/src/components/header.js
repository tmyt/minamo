import React from 'react';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import Avatar from './avatar';
import Container from './container';
import Hamburger from './hamburger';

export default class HeaderComponent extends React.Component {
  onSelect(){
    const display = $('#expand-button').css('display');
    if(display === 'none') return;
    console.log(display);
    if(!$('#navbar-main').hasClass('in')) return;
    $('#expand-button').click();
  }
  render(){
    let extraTabMenu = null;
    if(this.props.tabs){
      extraTabMenu = this.props.tabs;
    }
    return (
      <header>
        <div className='navbar navbar-default navbar-static-top' id='header_nav'>
          <Container>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to='/'>minamo.io</Link>
              </Navbar.Brand>
              <button id='expand-button' className='navbar-toggle collapsed' type='button' data-toggle='collapse' data-target='#navbar-main'>
                <Hamburger />
              </button>
            </Navbar.Header>
            <Navbar.Collapse id='navbar-main'>
              <div className='nav navbar-right'>
                <Avatar />
              </div>
              <Nav navbar={true} onSelect={this.onSelect}>
                <LinkContainer to='/console'><NavItem>console</NavItem></LinkContainer>
                <LinkContainer to='/console/logstream'><NavItem>log stream</NavItem></LinkContainer>
                <LinkContainer to='/console/terminal'><NavItem>terminal</NavItem></LinkContainer>
              </Nav>
            </Navbar.Collapse>
          </Container>
          {extraTabMenu}
        </div>
      </header>
    );
  }
}
