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

function isRunning(text){
  return text === 'running';
}

function toEnabled(state){
  return state ? 'enabled' : 'disabled';
}

function updateStatus(){
  $.get('/api/status', function(json){
    var dom = new Dom();
    var table = $('<table></table>').addClass('table table-hover')
      .append($('<tr></td>')
        .append(dom.th('name'))
        .append(dom.th('status'))
        .append(dom.th('head'))
        .append(dom.th('created'))
        .append(dom.th('uptime'))
        .append(dom.th('repo'))
        .append(dom.th('action'))
        .append(dom.th('remove'))
    );
    var keys = Object.keys(json);
    for(var i = 0; i < keys.length; ++i){
      var actions = $('<select>').addClass('form-control');
      var cont = json[keys[i]];
      var status = cont.status;
      actions.change(performAction(keys[i], actions))
        .append($('<option>').text('---').attr('value', '-'))
        .append($('<option>').text('start').attr('value', 'start').attr(toEnabled(!isRunning(status)),''))
        .append($('<option>').text('stop').attr('value', 'stop').attr(toEnabled(isRunning(status)), ''))
        .append($('<option>').text('restart').attr('value', 'restart').attr(toEnabled(isRunning(status)), ''))
      table.append($('<tr>')
        .append($('<td>').append($('<a>').attr('href', '//' + keys[i] + '.' + rootDomain()).text(keys[i])))
        .append($('<td>').append($('<span></span>').text(status).addClass(isRunning(status)?'label label-success':'label label-danger')))
        .append($('<td>').text(cont.head))
        .append($('<td>').text(cont.created ? new Date(cont.created).toLocaleString() : ""))
        .append($('<td>').text(cont.uptime))
        .append($('<td>').append($('<input>').addClass('form-control').val('http://git.' + rootDomain() + '/' + keys[i] + '.git')))
        .append($('<td>').append(actions))
        .append($('<td>').append($('<button>', {'class': 'btn btn-danger'}).text('remove').click(removeHandler(keys[i]))))
      );
    }
    $('#statuses').children().remove();
    $('#statuses').append(table);
  });
}

function load(){
  updateStatus();
  $('#newform').submit(createNew);
  $('#service_name').keyup(function(){
    if($('#service_name').val() === ""){
      $('#service_name_group').removeClass('has-success').removeClass('has-error');
      $('#service_name_glyph').removeClass('glyphicon-ok').removeClass('glyphicon-remove');
    }else if($('#service_name').val().match(/^[a-z0-9-]+$/)){
      $('#service_name_group').addClass('has-success').removeClass('has-error');
      $('#service_name_glyph').addClass('glyphicon-ok').removeClass('glyphicon-remove');
    }else{
      $('#service_name_group').addClass('has-error').removeClass('has-success');
      $('#service_name_glyph').addClass('glyphicon-remove').removeClass('glyphicon-ok');
    }
  });
}
