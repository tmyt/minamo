import PopupComponent from './pages/popup';
import AppComponent from './pages/app';
import IndexComponent from './pages/index';
import LoginComponent from './pages/login';
import ConsoleComponent from './pages/console';
import LogStreamComponent from './pages/logstream';
import TerminalComponent from './pages/terminal';
import PopupTerminalComponent from './pages/popup-terminal';

import Authorized from './components/authorized';

const routes = {
  path: '',
  component: PopupComponent,
  childRoutes: [
  {
    component: AppComponent,
    childRoutes: [
    {
      path: '/',
      component: IndexComponent
    },
    {
      path: '/login',
      component: LoginComponent
    },
    {
      component: Authorized,
      onEnter: Authorized.verifyCredentials,
      childRoutes: [
      {
        path: '/console',
        component: ConsoleComponent
      },
      {
        path: '/console/logstream',
        component: LogStreamComponent
      },
      {
        path: '/console/terminal',
        component: TerminalComponent
      }]
    }]
  },
  {
    component: Authorized,
    onEnter: Authorized.verifyCredentials,
    childRoutes: [
    {
      path: '/console/terminal_popup',
      component: PopupTerminalComponent
    }]
  }]
};

export { routes };
