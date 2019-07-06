import React from 'react';
import { Nav } from 'react-bootstrap';
import TabItem from '../tab-item';

export default class ConsoleTabsComponent extends React.Component{
  render(){
    return (
      <div id='console-tab'>
        <div className='container'>
          <Nav as='ul' variant='tabs'>
            <TabItem to='#tab-statuses' default={true}>statuses</TabItem>
            <TabItem to='#tab-create'>create</TabItem>
            <TabItem to='#tab-configure'>configure</TabItem>
          </Nav>
        </div>
      </div>
    );
  }
}
