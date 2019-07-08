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
          <h1 className='display-3'>{this.context.config.site}</h1>
          <p className='lead'>private PaaS platform for you</p>
          <p><ConsoleButtonComponent /></p>
        </Jumbotron>
      </PageRoot>
    );
  }
}
IndexComponent.contextTypes = {
  config: PropTypes.object,
};
