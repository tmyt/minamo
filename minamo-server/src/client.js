import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { loadComponents } from 'loadable-components';
import Routes from './routes';
import Meta from './components/meta';

System.import('bootstrap-umi/dist/js/bootstrap.js');

if(Meta.components){
  window.__LOADABLE_COMPONENT_IDS__ = JSON.parse(Meta.components);
}

loadComponents().then(() => {
  ReactDOM.hydrate((
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  ), document.getElementById('app'));
});
