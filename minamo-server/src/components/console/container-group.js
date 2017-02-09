import React from 'react';

import ContainerListLargeComponent from './container-list-large';
import ContainerListSmallComponent from './container-list-small';

export default class ContainerGroupComponent extends React.Component {
  constructor(){
    super();
    this.state = {data: []};
  }
  componentWillMount(){
    this.updateState(this.props.data || {});
  }
  componentWillReceiveProps(newProps){
    this.updateState(newProps.data);
  }
  updateState(state = {}){
    this.cookie = state.cookie || '';
    this.setState({data: state.statuses || []});
  }
  render(){
    if(this.context.viewSize === ''){
      return (
        <div>
          <ContainerListSmallComponent className='visible-xs' data={this.state.data}/>
          <ContainerListLargeComponent className='hidden-xs' data={this.state.data}/>
        </div>
      );
    }
    const list = this.context.viewSize === 'xs'
      ? <ContainerListSmallComponent data={this.state.data}/>
      : <ContainerListLargeComponent data={this.state.data}/>;
    return (list);
  }
}
ContainerGroupComponent.contextTypes = {
  viewSize: React.PropTypes.string,
}
