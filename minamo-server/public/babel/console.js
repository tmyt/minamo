// Import ReactBootstrap objects
var Table = ReactBootstrap.Table;
var Label = ReactBootstrap.Label;
var Tooltip = ReactBootstrap.Tooltip;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Input = ReactBootstrap.Input;
var Button = ReactBootstrap.Button;
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;
var PanelGroup = ReactBootstrap.PanelGroup;
var Panel = ReactBootstrap.Panel;
var Collapse = ReactBootstrap.Collapse;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;

var ServiceLink = React.createClass({
  render: function(){
    var uri = '//' + this.props.service + '.' + rootDomain();
    var label = this.props.service + (this.props.short ? '' : '.' + rootDomain());
    return (<a href={uri}>{label}</a>); 
  }
});

var ServiceStatus = React.createClass({
  render: function(){
    var style = toLabelColor(this.props.status);
    return (<Label bsStyle={style}>{this.props.status}</Label>);
  }
});

var ServiceHead = React.createClass({
  render: function(){
    if(this.props.external) return(<span className="text-muted">external</span>);
    return (<span>{this.props.head}</span>);
  }
});

var ServiceUptime = React.createClass({
  render: function(){
    var tooltip = (<Tooltip>{this.props.created}</Tooltip>);
    return (
      <OverlayTrigger overlay={tooltip} placement="top">
        <span>{this.props.uptime}</span>
      </OverlayTrigger>
    );
  }
});

var ServiceRepoUri = React.createClass({
  render: function(){
    var proto = location.protocol;
    var repo = proto + '//git.' + rootDomain() + '/' + this.props.name + '.git';
    if(this.props.authkey) repo = proto + '//' + rootDomain() + '/api/hooks/' + this.props.name + '?key=' + this.props.authkey;
    return (<input value={repo} type="text" className="form-control" />);
  }
});

var ServiceAction = React.createClass({
  onSelect: function(e, key){
    switch(key){
      case "start":
        startContainer(this.props.name);
        break;
      case "stop":
        stopContainer(this.props.name);
        break;
      case "restart":
        restartContainer(this.props.name);
        break;
    }
  },
  render: function(){
    var commands = [];
    if(isRunning(this.props.status)){
      commands = ['stop', 'restart'];
    }else if(isStopped(this.props.status)){
      commands = ['start'];
    }
    var items = commands.map(function(item){
      return (<MenuItem eventKey={item}>{item}</MenuItem>);
    }.bind(this));
    return (<DropdownButton title="Action" onSelect={this.onSelect}>{items}</DropdownButton>);
  }
});

var ServiceRemoveButton = React.createClass({
  onClick: function(e){
    removeHandler(this.props.name);
  },
  render: function(){
    return(<Button bsStyle="danger" onClick={this.onClick}>remove</Button>);
  }
});

var ContainersTableHeader = React.createClass({
  render: function(){
    var names = ['name', 'status', 'head', 'uptime', 'repo', 'action', 'remove'];
    var headers = names.map(function(n){
      return (<th key={'tr_' + n}>{n}</th>);
    });
    return (<tr>{headers}</tr>);
  }
});

var ContainersTableRow = React.createClass({
  render: function(){
    var data = this.props.data;
    return (
      <tr>
        <td><ServiceLink service={this.props.name} short /></td>
        <td><ServiceStatus status={data.status} /></td>
        <td><ServiceHead head={data.head} external={data.repo==='external'} /></td>
        <td><ServiceUptime created={new Date(data.created).toLocaleString()} uptime={data.uptime} /></td>
        <td><ServiceRepoUri name={this.props.name} authkey={data.key} /></td>
        <td><ServiceAction name={this.props.name} status={data.status}/></td>
        <td><ServiceRemoveButton name={this.props.name} /></td>
      </tr>
    );
  }
});

var ContainerListLarge = React.createClass({
  render: function(){
    var data = this.props.data;
    var rows = Object.keys(data).map(function(container){
      return (<ContainersTableRow name={container} data={data[container]} key={container} />);
    });
    return (
      <Table hover>
        <thead>
          <ContainersTableHeader />
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  }
});

var ContainerPane = React.createClass({
  render: function(){
    var data = this.props.data;
    var header = (
      <Row>
        <Col xs={6}>
          <h4 className="visible-xs-inline">{this.props.name}</h4>
        </Col>
        <Col xs={6} className="text-right">
          <ServiceStatus status={data.status} />
        </Col>
      </Row>
    );
    return (
      <PanelGroup>
        <Panel header={header} collapsible>
          <dl className="dl-horizontal">
            <dt>service</dt>
            <dd><ServiceLink service={this.props.name} /></dd>
            <dt>head</dt>
            <dd><ServiceHead head={data.head} external={data.repo==='external'} /></dd>
            <dt>uptime</dt>
            <dd><ServiceUptime created={new Date(data.created).toLocaleString()} uptime={data.uptime} /></dd>
            <dt>repo</dt>
            <dd><ServiceRepoUri name={this.props.name} authkey={data.key} /></dd>
          </dl>
          <ServiceAction name={this.props.name} status={data.status} />
          <span> </span>
          <ServiceRemoveButton name={this.props.name} />
        </Panel>
      </PanelGroup>
    );
  }
});

var ContainerListSmall = React.createClass({
  render: function(){
    var data = this.props.data;
    var rows = Object.keys(data).map(function(container){
      return (<ContainerPane name={container} data={data[container]} key={container + '_xs'} />);
    });
    return (<div>{rows}</div>);
  }
});

var ContainerGroup = React.createClass({
  updateState: function(){
    $.get('/api/status', {'t': Date.now()}, function(json){
      this.setState({data: json});
    }.bind(this));
  },
  getInitialState: function(){
    return {data: {}};
  },
  componentDidMount: function(){
    this.updateState();
    setInterval(this.updateState, this.props.pollInterval);
  },
  render: function(){
    return (
      <div>
        <div className="hidden-xs">
          <ContainerListLarge data={this.state.data}/>
        </div>
        <div className="visible-xs">
          <ContainerListSmall data={this.state.data}/>
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <ContainerGroup pollInterval={5000}/>,
  document.getElementById('statuses')
);
