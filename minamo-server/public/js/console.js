function rootDomain(){
  return window.location.hostname;
}

function removeHandler(name){
  return function(){
    if(window.confirm('This container permanently removed. Are you sure?')){
      $.get('/api/destroy', {'service': name}, function(){
        updateStatus();
      });
    }
  }
}

function performAction(name, actions){
  return function(){
    if(actions.val() === '-'){
      return;
    }else if(actions.val() === 'start'){
      actions.val('-');
      $.get('/api/start', {'service': name}, function(){
        updateStatus();
      });
      return;
    }else if(actions.val() === 'stop'){
      actions.val('-');
      $.get('/api/stop', {'service': name}, function(){
        updateStatus();
      });
      return;
    }else if(actions.val() === 'restart'){
      actions.val('-');
      $.get('/api/restart', {'service': name}, function(){
        updateStatus();
      });
      return;
    }
  }
}

function createNew(){
  var name = document.new_container.service.value;
  if(!name.match(/^[a-z0-9-]+$/)){
    $('#errmsg').text('error: service name should be [a-z0-9-]+');
    return false;
  }
  $.get('/api/create', {'service': name}, function(){
    document.new_container.service.value = "";
    updateStatus();
  });
  return false;
}

function updateStatus(){
  $.get('/api/status', function(json){
    var table = $('<table>').attr('border', '1')
      .append($('<tr>')
        .append($('<th>').text('name'))
        .append($('<th>').text('status'))
        .append($('<th>').text('head'))
        .append($('<th>').text('created'))
        .append($('<th>').text('uptime'))
        .append($('<th>').text('repo'))
        .append($('<th>').text('action'))
        .append($('<th>').text('remove'))
    );
    var keys = Object.keys(json);
    for(var i = 0; i < keys.length; ++i){
      var actions = $('<select>');
      var status = json[keys[i]].status;
      actions.change(performAction(keys[i], actions))
        .append($('<option>').text('---').attr('value', '-'))
        .append($('<option>').text('start').attr('value', 'start').attr(status==='running'?'disabled':'enabled',''))
        .append($('<option>').text('stop').attr('value', 'stop').attr(status==='running'?'enabled':'disabled',''))
        .append($('<option>').text('restart').attr('value', 'restart').attr(status==='running'?'enabled':'disabled',''));
      table.append($('<tr>')
        .append($('<td>').append($('<a>').attr('href', '//' + keys[i] + '.' + rootDomain()).text(keys[i])))
        .append($('<td>').text(json[keys[i]].status))
        .append($('<td>').text(json[keys[i]].head))
        .append($('<td>').text(json[keys[i]].created ? new Date(json[keys[i]].created).toLocaleString() : ""))
        .append($('<td>').text(json[keys[i]].uptime))
        .append($('<td>').append($('<input>').val('http://git.' + rootDomain() + '/' + keys[i] + '.git')))
        .append($('<td>').append(actions))
        .append($('<td>').append($('<button>').text('remove').click(removeHandler(keys[i]))))
      );
    }
    $('#statuses').children().remove();
    $('#statuses').append(table);
  });
}

function load(){
  updateStatus();
  $('#newform').submit(createNew);
}
