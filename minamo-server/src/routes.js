import PopupComponent from './pages/popup';
import AppComponent from './pages/app';
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
      getComponent: (location, callback) => {
        System.import('./pages/index').then(component => callback(null, component.default));
      }
    },
    {
      path: '/login',
      getComponent: (location, callback) => {
        System.import('./pages/login').then(component => callback(null, component.default));
      }
    },
    {
      component: Authorized,
      onEnter: Authorized.verifyCredentials,
      childRoutes: [
      {
        path: '/console',
        getComponent: (location, callback) => {
          System.import('./pages/console').then(component => callback(null, component.default));
        }
      },
      {
        path: '/console/logstream',
        getComponent: (location, callback) => {
          System.import('./pages/logstream').then(component => callback(null, component.default));
        }
      },
      {
        path: '/console/terminal',
        getComponent: (location, callback) => {
          System.import('./pages/terminal').then(component => callback(null, component.default));
        }
      }]
    }]
  },
  {
    component: Authorized,
    onEnter: Authorized.verifyCredentials,
    childRoutes: [
    {
      path: '/console/terminal_popup',
      getComponent: (location, callback) => {
        System.import('./pages/popup-terminal').then(component => callback(null, component.default));
      }
    }]
  }]
};

export { routes };
