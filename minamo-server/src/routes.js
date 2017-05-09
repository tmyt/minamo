import PopupComponent from './pages/popup';
import AppComponent from './pages/app';
import Authorized from './components/authorized';

const routes = {
  component: PopupComponent,
  childRoutes: [
  {
    path: '/',
    component: AppComponent,
    indexRoute: {
      getComponent: (location, callback) => {
        System.import('./pages/index').then(component => callback(null, component.default));
      }
    },
    childRoutes: [
    {
      path: 'login',
      getComponent: (location, callback) => {
        System.import('./pages/login').then(component => callback(null, component.default));
      }
    },
    {
      path: 'console',
      component: Authorized,
      onEnter: Authorized.verifyCredentials,
      indexRoute: {
        getComponent: (location, callback) => {
          System.import('./pages/console').then(component => callback(null, component.default));
        }
      },
      childRoutes: [
      {
        path: 'logstream',
        getComponent: (location, callback) => {
          System.import('./pages/logstream').then(component => callback(null, component.default));
        }
      },
      {
        path: 'terminal',
        getComponent: (location, callback) => {
          System.import('./pages/terminal').then(component => callback(null, component.default));
        }
      },
      {
        path: 'sysinfo',
        getComponent: (location, callback) => {
          System.import('./pages/sysinfo').then(component => callback(null, component.default));
        }
      }]
    },
    {
      path: 'admin',
      component: Authorized,
      onEnter: Authorized.verifyAdminCredentials,
      indexRoute: {
        getComponent: (location, callback) => {
          System.import('./pages/admin').then(component => callback(null, component.default));
        }
      }
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
