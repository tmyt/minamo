function rootDomain(){
  return window.location.hostname;
}

function removeHandler(name){
  if(window.confirm('This container permanently removed. Are you sure?')){
    $.get('/api/destroy', {'service': name, 't': Date.now()}, function(){ });
  }
}

function createNew(){
  var name = document.new_container.service.value;
  var template = document.new_container.template.value;
  var external = document.new_container.external.value;
  if(!name.match(/^[a-z0-9-]+$/)){
    $('#errmsg').text('error: service name should be [a-z0-9-]+');
    return false;
  }
  $.get('/api/create', {'service': name, 'template': template, 'external': external, 't': Date.now()}, function(){
    document.new_container.service.value = "";
    showToast('', 'Service created', 'success');
  });
  return false;
}

function updateCredentials(){
  $.ajax({
    type: 'POST',
    url: '/api/credentials/update',
    data: {'password': $('#password').val()},
    success: function(){
      showToast('', 'Update successful', 'success');
      $('#password').val('');
    },
    error: function(){
      showToast('', 'Update failed', 'danger');
    }
  });
  return false;
}

function showToast(title, message, kind){
  var button = $('<button class="close" data-dismiss="alert">').html('&times;');
  var message = $('<div id="inner-message" class="alert">')
    .addClass("alert-" + kind).append(button).append(message);
  $('#message-container').children().remove();
  $('#message-container').append(message);
}

function isRunning(text){
  return text === 'running';
}

function isStopped(text){
  return text === 'stopped';
}

function isPrepareing(text){
  return text === 'prepareing';
}

function isStopping(text){
  return text === 'stopping';
}

function toLabelColor(text){
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
}

$(document).ready(function(){
  load();
})
