import React from 'react';
import { Route, Switch } from 'react-router';
import loadable from 'loadable-components';

import PopupComponent from './pages/popup';
import AppComponent from './pages/app';
import Authorized from './components/authorized';

const AuthorizedRoute = ({component: Component, ...rest}) => (
  <Route {...rest} render={props => (
    <Authorized isAdmin={props.isAdmin}>
      <Component {...props} />
    </Authorized>
  )}/>
);

const Terminal = loadable(() => System.import('./pages/terminal'));
const TerminalPopup = loadable(() => System.import('./pages/popup-terminal'));
const Index = loadable(() => System.import('./pages/index'));
const Login = loadable(() => System.import('./pages/login'));
const Console = loadable(() => System.import('./pages/console'));
const LogStream = loadable(() => System.import('./pages/logstream'));
const SysInfo = loadable(() => System.import('./pages/sysinfo'));
const Admin = loadable(() => System.import('./pages/admin'));

const Routes = () => {
  return(
    <PopupComponent>
      <Switch>
        <AuthorizedRoute path='/console/terminal' component={Terminal} />
        <AuthorizedRoute path='/console/terminal_popup' component={TerminalPopup} />
        <Route path='/'>
          <AppComponent>
            <Route exact path='/' component={Index} />
            <Route path='/login' component={Login} />
            <AuthorizedRoute exact path='/console' component={Console} />
            <AuthorizedRoute path='/console/logstream' component={LogStream} />
            <AuthorizedRoute path='/console/sysinfo' component={SysInfo} />
            <AuthorizedRoute path='/admin' component={Admin} isAdmin/>
          </AppComponent>
        </Route>
      </Switch>
    </PopupComponent>
  );
};

export default Routes;
