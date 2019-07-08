import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, matchPath } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav, Navbar } from 'react-bootstrap';
import Avatar from './avatar';
import Container from './container';
import ConsoleTabs from './console/tabs';
import IntegratedShellButton from './ish-button';
import isActive from '../lib/isactive';

const NavLink = withRouter(({location, to, exact, children}) => (
  <Nav.Item className={ matchPath(location.pathname, { path: to, exact: !!exact }) ? 'active' : '' }>
    <LinkContainer to={to} exact={exact}><Nav.Link href={to}>{children}</Nav.Link></LinkContainer>
  </Nav.Item>
));

class HeaderComponent extends React.Component {
  constructor(){
    super();
    this.onClickISH = this.onClickISH.bind(this);
  }
  onClickISH(){
    if(typeof(this.props.onLaunchISH) === 'function'){
      this.props.onLaunchISH();
    }
  }
  render(){
    let extraTabMenu = null;
    let adminTabItem = null;
    if(this.props.location && isActive(this.props, '/console', true)){
      extraTabMenu = (<ConsoleTabs />);
    }
    if(this.context.profile && this.context.profile.role === 'admin'){
      adminTabItem = (<NavLink to='/admin'>admin</NavLink>);
    }
    return (
      <header className={extraTabMenu ? 'has-tabbar' : ''}>
        <Navbar expand='md' bg='primary' variant='dark' collapseOnSelect sticky={null}>
          <Container>
            <LinkContainer to='/'>
            <Navbar.Brand href='/'>{this.context.config.site}</Navbar.Brand>
            </LinkContainer>
            <span className='ml-auto d-block d-md-none'>
              <IntegratedShellButton onClick={this.onClickISH} className='ml-auto' xs={true} />
            </span>
            <Navbar.Toggle aria-controls='navbar-main' />
            <Navbar.Collapse id='navbar-main'>
              <span className='d-block d-md-none'>
                <Avatar visible={this.context.isAuthenticated}/>
              </span>
              <Nav className='mr-auto' variant='pills'>
                <NavLink to='/console' exact={true}>console</NavLink>
                <NavLink to='/console/logstream'>log stream</NavLink>
                <NavLink to='/console/sysinfo'>sysinfo</NavLink>
                {adminTabItem}
              </Nav>
              <Nav>
                <span className='d-none d-md-inline'>
                  <IntegratedShellButton onClick={this.onClickISH} className='ml-auto'/>
                  <Avatar visible={this.context.isAuthenticated}/>
                </span>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        {extraTabMenu}
      </header>
    );
  }
}
HeaderComponent.contextTypes = {
  isAuthenticated: PropTypes.bool,
  profile: PropTypes.object,
  config: PropTypes.object,
};

export default withRouter(HeaderComponent);
