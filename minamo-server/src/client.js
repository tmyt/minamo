import React from 'react';
import ReactDOM from 'react-dom';
import { match, Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import { routes } from './routes';

System.import('Umi/dist/js/bootstrap.js');

match({ routes, history: createBrowserHistory() }, (error, redirect, renderProps) => {
  ReactDOM.render(
    <Router {...renderProps} />,
    document.getElementById('app')
  );
});
