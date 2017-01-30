import React from 'react';
import { Nav } from 'react-bootstrap';
import TabItem from '../components/tab-item';
import TabPage from '../components/tab-page';
import PageRoot from '../components/page-root';

import Statuses from './console/statuses';
import Create from './console/create';
import Configure from './console/configure';

export default class ConsoleComponent extends React.Component{
  componentWillMount(){
    this.context.setTabbar(<ConsoleComponent.Tabs />);
  }
  componentWillUnmount(){
    this.context.setTabbar(null);
  }
  render(){
    return (
      <PageRoot title='console'>
        <div className='tab-content'>
          <TabPage default={true} id='tab-statuses'>
            <Statuses />
          </TabPage>
          <TabPage id='tab-create'>
            <Create />
          </TabPage>
          <TabPage id='tab-configure'>
            <Configure />
          </TabPage>
        </div>
      </PageRoot>
    );
  }
}

ConsoleComponent.Tabs = class extends React.Component{
  render(){
    return (
      <div id='console-tab'>
        <div className='container'>
          <Nav bsStyle='tabs'>
            <TabItem to='#tab-statuses' default={true}>statuses</TabItem>
            <TabItem to='#tab-create'>create</TabItem>
            <TabItem to='#tab-configure'>configure</TabItem>
          </Nav>
        </div>
      </div>
    );
  }
};
ConsoleComponent.contextTypes = {
  setTabbar: React.PropTypes.func
};
