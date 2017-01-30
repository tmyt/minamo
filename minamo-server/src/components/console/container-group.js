import React from 'react';

import ContainerListLargeComponent from './container-list-large';
import ContainerListSmallComponent from './container-list-small';

export default class ContainerGroupComponent extends React.Component {
  constructor(){
    super();
    this.state = {data: []};
  }
  componentWillReceiveProps(newProps){
    this.updateState(newProps.data);
  }
  updateState(state = {}){
    this.cookie = state.cookie || '';
    this.setState({data: state.statuses || []});
  }
  render(){
    return (
      <div>
        <div className="hidden-xs">
          <ContainerListLargeComponent data={this.state.data}/>
        </div>
        <div className="visible-xs">
          <ContainerListSmallComponent data={this.state.data}/>
        </div>
      </div>
    );
  }
}
