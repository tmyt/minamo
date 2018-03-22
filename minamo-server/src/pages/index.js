import React from 'react';
import PropTypes from 'prop-types';
import { Jumbotron } from 'react-bootstrap';

import PageRoot from '../components/page-root';
import ConsoleButtonComponent from '../components/console-button';

export default class IndexComponent extends React.Component {
  render(){
    return (
      <PageRoot>
        <Jumbotron>
          <h1>{this.context.config.site}</h1>
          <p>private PaaS platform for you</p>
          <ConsoleButtonComponent />
        </Jumbotron>
      </PageRoot>
    );
  }
}
IndexComponent.contextTypes = {
  config: PropTypes.object,
};
