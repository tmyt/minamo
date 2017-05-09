import React from 'react';
import TabPage from '../components/tab-page';
import PageRoot from '../components/page-root';

import Statuses from './console/statuses';
import Create from './console/create';
import Configure from './console/configure';

export default class ConsoleComponent extends React.Component{
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
