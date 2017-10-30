import React from 'react';
import { Route, Switch } from 'react-router';

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

const AppIndex = () => (
  <PopupComponent>
    <Switch>
      <AuthorizedRoute path='/console/terminal' component={require('./pages/terminal').default} />
      <AuthorizedRoute path='/console/terminal_popup' component={require('./pages/popup-terminal').default} />
      <Route path='/'>
        <AppComponent>
          <Route exact path='/' component={require('./pages/index').default} />
          <Route path='/login' component={require('./pages/login').default} />
          <AuthorizedRoute exact path='/console' component={require('./pages/console').default} auth={true} />
          <AuthorizedRoute path='/console/logstream' component={require('./pages/logstream').default} auth={true} />
          <AuthorizedRoute path='/console/sysinfo' component={require('./pages/sysinfo').default} auth={true} />
          <AuthorizedRoute path='/admin' component={require('./pages/admin').default} auth={true} isAdmin={true} />
        </AppComponent>
      </Route>
    </Switch>
  </PopupComponent>
);

export default AppIndex;
