function removeHandler(name){
  if(window.confirm('This container permanently removed. Are you sure?')){
    $.get('/api/destroy', {'service': name, 't': Date.now()}, function(){ });
  }
}

function createNew(){
  var name = $('#service_name').val();
  var template = $('#template').val();
  var external = $('#external_repo').val();
  if(!name.match(/^[a-z0-9-]+$/)){
    $('#errmsg').text('error: service name should be [a-z0-9-]+');
    return false;
  }
  $.ajax({
    type: 'GET',
    url: '/api/create',
    data: {'service': name, 'template': template, 'external': external, 't': Date.now()},
    success: function(){
      $('#service_name_group').removeClass('has-success').removeClass('has-error');
      $('#service_name_glyph').removeClass('glyphicon-ok').removeClass('glyphicon-remove');
      $('#service_name').val("");
      $('#external_repo').val("");
      showToast('', 'Service "' + name + '" created', 'success');
    },
    error: function(request){
      showToast('', 'Service "' + name + '" creation failed. ' + request.responseText, 'warning');
    }
  });
  return false;
}

function updateCredentials(){
  $.ajax({
    type: 'POST',
    url: '/api/credentials/update',
    data: {'password': $('#password').val()},
    success: function(){
      showToast('', 'Credential update successful', 'success');
      $('#password').val('');
    },
    error: function(){
      showToast('', 'Credential update failed', 'warning');
    }
  });
  return false;
}

function showToast(title, message, kind){
  toastr[kind](message, title);
}

function isRunning(text){
  return text === 'running';
}

function isStopped(text){
  return text === 'stopped' || isExited(text);
}

function isPrepareing(text){
  return text === 'prepareing';
}

function isStopping(text){
  return text === 'stopping';
}

function isExited(text){
  return text === 'exited';
}

function toLabelColor(text){
  if(isExited(text)) return 'primary';
  if(isRunning(text)) return 'success';
  if(isPrepareing(text)) return 'info';
  if(isStopping(text)) return 'warning';
  if(isStopped(text)) return 'danger';
}

function startContainer(name){
  $.get('/api/start', {'service': name, 't': Date.now()}, function(){ });
}

function stopContainer(name){
  $.get('/api/stop', {'service': name, 't': Date.now()}, function(){ });
}

function restartContainer(name){
  $.get('/api/restart', {'service': name, 't': Date.now()}, function(){ });
}

function showEnvConfig(name){
  // clear
  $('#envlist').children().remove();
  $('#envlist').append($('<thead><tr><th>name</th><th>value</th></tr></thead>'));
  $('#target_service').val(name);
  $.get('/api/env', {'service': name, 't': Date.now()}, function(json){
    var env = JSON.parse(json);
    // add trailing button
    var keys = Object.keys(env);
    for(var i = 0; i < keys.length; ++i){
      $('#envlist').append(createEnvRow(keys[i], env[keys[i]]));
    }
    $('#envlist').append(createAddNewButton());
    $('#envconfig_frame').modal();
  });
}

function showLogs(name){
  $.get('/api/logs', {'service': name, 't': Date.now()}, function(logs){
    $('#logs').val(logs);
    $('#logs_frame').modal();
  });
}

function createAddNewButton(){
  var addnew = $('<tr id="envlist_addnew"><td colspan="3"><button class="btn btn-default form-control">add new</button>');
  addnew.find('button').click(function(){
    $('#envlist_addnew').remove();
    $('#envlist').append(createEnvRow()).append(createAddNewButton());
    return false;
  });
  return addnew;
}

function createEnvRow(name, value){
  var row = $('<tr data-env="env-item"/>');
  row.append($('<td><input class="form-control" name="env-name" /></td>'));
  row.append($('<td><input class="form-control" name="env-value" /></td>'));
  row.append($('<td><button class="btn btn-danger form-control"><span class="glyphicon glyphicon-trash" /></button></td>'));
  row.find('input[name="env-name"]').val(name || '');
  row.find('input[name="env-value"]').val(value || '');
  row.find('button').click(function(){
    row.remove();
    return false;
  })
  return row;
}

function load(){
  $('#newform').submit(createNew);
  $('#credentialform').submit(updateCredentials);
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
  $('#external_repo').keyup(function(){
    if($('#external_repo').val() === ""){
      $('#template').prop('disabled', false);
    }else{
      $('#template').prop('disabled', true);
    }
  });
  $('#env_save').click(function(){
    var items = $('#envlist tr[data-env="env-item"]');
    var env = {};
    for(var i = 0 ; i < items.length; ++i){
      var name = items.eq(i).find('input[name="env-name"]').val();
      var value = items.eq(i).find('input[name="env-value"]').val();
      env[name] = value;
    }
    $.ajax({
      type: 'POST',
      url: '/api/env/update',
      data: {'env': JSON.stringify(env), 'service': $('#target_service').val()},
      success: function(){ },
      error: function(){
        showToast('', 'Env update failed', 'warning');
      }
    });
  });
}

$(document).ready(function(){
  load();
})
