import React from 'react';
import DocumentTitle from 'react-document-title';
import Container from './container';

export default class PageRootComponent extends React.Component{
  render(){
    const title = this.props.title || '';
    return (
      <DocumentTitle title={title + (title && ' | ') + 'minamo.cloud'}>
        <Container>
          {this.props.children}
        </Container>
      </DocumentTitle>
    );
  }
}
