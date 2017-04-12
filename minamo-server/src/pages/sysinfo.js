import React from 'react';
import {Row, Col} from 'react-bootstrap';
import {Line} from 'react-chartjs-2';
import Socket from 'socket.io-client';

import PageRoot from '../components/page-root';

class BaseGraph extends React.Component{
  constructor(props){
    super(props);
    this.config = {
      logs: this.props.logs || 60,
      timeSpan: this.props.timeSpan || 5000,
      stepSize: this.props.stepSize || 60,
      unit: this.props.unit || 'second'
    };
    this.data = [];
    this.ticks = Array.apply(null, Array(this.config.logs)).map((_, i) => new Date(Date.now() - (this.config.logs - i - 1) * this.config.timeSpan));
    for(let i = 0; i < props.labels.length; ++i){
      this.data[i] = Array.apply(null, Array(this.config.logs)).map(() => 0);
    }
    this.state = { chartData: this.genData(this.props.labels) };
  }
  genData(labels){
    const ret = {
      labels: this.ticks.slice(0),
      datasets: []
    };
    const colors = [
      '255,  99, 132', ' 54, 162, 235', '255, 206,  86',
      ' 75, 192, 192', '153, 102, 255', '255, 159,  64'
    ];
    for(let i = 0; i < labels.length; ++i){
      ret.datasets.push( {
        label: labels[i],
        fill: true,
        lineTension: 0.1,
        backgroundColor: `rgba(${colors[i]},0.4)`,
        borderColor: `rgba(${colors[i]},1)`,
        pointBorderColor: `rgba(${colors[i]},1)`,
        pointBackgroundColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: `rgba(${colors[i]},1)`,
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: this.data[i].slice(0)
      });
    }
    return ret;
  }
  componentWillReceiveProps(newProps){
    if(newProps.history !== this.props.history && newProps.history){
      this.ticks = newProps.history.map(x => new Date(x[0]));
      for(let i = 0; i < this.props.labels.length; ++i){
        for(let j = 0; j < newProps.history.length; ++j){
          this.data[i].shift();
          this.data[i].push((newProps.history[j][1] && newProps.history[j][1][this.props.labels[i]]) || 0);
        }
      }
      this.setState({ chartData: this.genData(this.props.labels) });
    }
    if(!newProps.data) return;
    if(newProps.data === this.props.data){
      return;
    }
    for(let i = 0; i < this.props.labels.length; ++i){
      this.data[i].shift();
      this.data[i].push(newProps.data[this.props.labels[i]]);
    }
    this.ticks.shift();
    this.ticks.push(new Date(newProps.dateAt));
    this.setState({ chartData: this.genData(this.props.labels) });
  }
  render(){
    const options = {
      tooltips: { mode: 'index' },
      animation: false,
      scales: {
        xAxes: [{
          type: 'time',
          time: { unit: this.config.unit, stepSize: this.config.stepSize },
          ticks: { maxRotation: 0 }
        }],
        yAxes: [{}]
      }
    };
    if(this.props.stacked){
      options.scales.yAxes[0].stacked = true;
    }
    if(this.props.beginAtZero){
      options.scales.yAxes[0].ticks = { beginAtZero: true };
    }
    return(
      <Line data={this.state.chartData} options={options} />
    );
  }
}
class CpuGraph extends React.Component{
  render(){
    return(
      <BaseGraph labels={['user', 'system']} beginAtZero={true} stacked={true} {...this.props} />
    );
  }
}
class RamGraph extends React.Component{
  render(){
    return(
      <BaseGraph labels={['used', 'cached', 'buffers', 'shared', 'free', 'swap']} beginAtZero={true} stacked={true} {...this.props} />
    );
  }
}
class NetGraph extends React.Component{
  render(){
    return(
      <BaseGraph labels={['tx', 'rx']} beginAtZero={true} {...this.props} />
    );
  }
}
export default class SysinfoComponent extends React.Component{
  constructor(){
    super();
    this.state = {summary: {}, history: { short: {}, long: {}}};
  }
  componentDidMount(){
    const socket = Socket('/sysinfo');
    socket.on('next', d => this.onReceive(d));
    socket.on('summary', d => this.onSummary(d));
    socket.on('history', d => this.onHistory(d));
    this.socket = socket;
  }
  componentWillUnmount(){
    if(!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }
  onReceive(d){
    const {cpu, ram, net, date} = d;
    this.setState({cpu, ram, net, date});
  }
  onSummary(d){
    this.setState({summary: d});
  }
  onHistory(d){
    const history = {
      short: {}, long: {}
    };
    history.short.cpu = d.short.map(x => [x.date, x.cpu]);
    history.short.ram = d.short.map(x => [x.date, x.ram]);
    history.short.net = d.short.map(x => [x.date, x.net]);
    history.long.cpu = d.long.map(x => [x.date, x.cpu]);
    history.long.ram = d.long.map(x => [x.date, x.ram]);
    history.long.net = d.long.map(x => [x.date, x.net]);
    this.setState({history});
  }
  render(){
    return(
      <PageRoot title='sysinfo'>
        <h2>System info</h2>
        <Row>
          <Col xs={12}><h3>CPU</h3></Col>
        </Row>
        <Row>
          <Col md={6}>
            <CpuGraph data={this.state.cpu} dateAt={this.state.date} history={this.state.history.short.cpu}/>
          </Col>
          <Col md={6}>
            <CpuGraph data={this.state.summary.cpu} dateAt={this.state.summary.date} logs={288} timeSpan={300000} unit='minute' stepSize={300} history={this.state.history.long.cpu}/>
          </Col>
        </Row>
        <Row>
          <Col xs={12}><h3>RAM</h3></Col>
        </Row>
        <Row>
          <Col md={6}>
            <RamGraph data={this.state.ram} dateAt={this.state.date} logs={60} steps={60} history={this.state.history.short.ram}/>
          </Col>
          <Col md={6}>
            <RamGraph data={this.state.summary.ram} dateAt={this.state.date} logs={288} timeSpan={300000} unit='minute' stepSize={300} history={this.state.history.long.ram}/>
          </Col>
        </Row>
        <Row>
          <Col xs={12}><h3>Network</h3></Col>
        </Row>
        <Row>
          <Col md={6}>
            <NetGraph data={this.state.net} dateAt={this.state.date} logs={60} steps={60} history={this.state.history.short.net}/>
          </Col>
          <Col md={6}>
            <NetGraph data={this.state.summary.net} dateAt={this.state.date} logs={288} timeSpan={300000} unit='minute' stepSize={300} history={this.state.history.long.net}/>
          </Col>
        </Row>
      </PageRoot>
    );
  }
};
