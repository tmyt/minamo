import React from 'react';
import ContainerPaneComponent from './container-pane';

export default class ContainerListSmallComponent extends React.Component{
  render(){
    let data = this.props.data;
    let rows = Object.keys(data).map(container =>
      (<ContainerPaneComponent name={container} data={data[container]} key={`${container}_xs`} />));
    return (<div>{rows}</div>);
  }
}
