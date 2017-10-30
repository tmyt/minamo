import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import Routes from './routes';

System.import('Umi/dist/js/bootstrap.js');

ReactDOM.hydrate((
  <BrowserRouter>
    <Routes />
  </BrowserRouter>
  ), document.getElementById('app')
);
