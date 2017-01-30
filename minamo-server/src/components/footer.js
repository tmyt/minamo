import React from 'react';
import Container from './container';

export default class FooterComponent extends React.Component{
  render(){
    return (
      <footer className='footer'>
        <Container>
          <p className="text-muted">Powered by minamo.io</p>
        </Container>
      </footer>
    );
  }
}
