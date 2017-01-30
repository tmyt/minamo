import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router';

import { routes } from './routes';

import createBrowserHistory from 'history/lib/createBrowserHistory';

import 'Umi/dist/css/bootstrap.css';
import './scss/styles';
import 'xterm/dist/xterm.css';
import 'font-awesome/css/font-awesome.css';
import 'toastr/toastr.scss';

import 'Umi/dist/js/bootstrap.js';

ReactDOM.render(
  <Router routes={routes} history={createBrowserHistory()} />,
  document.getElementById('app')
);
