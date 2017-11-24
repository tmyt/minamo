import React from 'react';
import { Jumbotron } from 'react-bootstrap';

import PageRoot from '../components/page-root';
import ConsoleButtonComponent from '../components/console-button';

export default class IndexComponent extends React.Component {
  render(){
    return (
      <PageRoot>
        <Jumbotron>
          <h1>minamo.cloud</h1>
          <p>private PaaS platform for you</p>
          <ConsoleButtonComponent />
        </Jumbotron>
      </PageRoot>
    );
  }
}
