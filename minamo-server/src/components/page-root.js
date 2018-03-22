import React from 'react';
import DocumentTitle from 'react-document-title';
import Container from './container';
import PropTypes from 'prop-types';

export default class PageRootComponent extends React.Component{
  render(){
    const title = this.props.title || '';
    return (
      <DocumentTitle title={title + (title && ' | ') + this.context.config.site}>
        <Container>
          {this.props.children}
        </Container>
      </DocumentTitle>
    );
  }
}
PageRootComponent.contextTypes = {
  config: PropTypes.object,
};
