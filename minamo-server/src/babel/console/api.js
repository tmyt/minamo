'use strict';

const ContainerRegexpString = '[a-z][a-z0-9-]*[a-z]';
const ContainerRegexp = new RegExp(`^${ContainerRegexpString}\$`);

const Internal = (function(){
  const nameFlags = ['has-error', 'has-success'];
  const glyphFlags = ['glyphicon-remove', 'glyphicon-ok'];

  function ajax(type, url, data, success, error){
    $.ajax({type, url, data, success, error});
  }

  function get(url, data, success, error){
    ajax('GET', url, data, success, error);
  }

  function post(url, data, success, error){
    ajax('POST', url, data, success, error);
  }

  function put(url, data, success, error){
    ajax('PUT', url, data, success, error);
  }

  function del(url, data, success, error){
    ajax('DELETE', url, data, success, error);
  }

  function clearValidation(){
    $('#service_name_group').removeClass(nameFlags.join(' '));
    $('#service_name_glyph').removeClass(glyphFlags.join(' '));
  }

  function clearForms(){
    $('#service_name').val('');
    $('#external_repo').val('');
  }

  function createNew(){
    let name = $('#service_name').val();
    let template = $('#template').val();
    let external = $('#external_repo').val();
    if(!name.match(ContainerRegexp)){
      $('#errmsg').text(`error: service name should be ${ContainerRegexpString}`);
      return false;
    }
    put(`/api/services/${name}`, {template, external},
      () => {
        clearValidation();
        clearForms();
        showToast(`Service "${name}" created`, 'success');
      },
      (request) => { showToast(`Service "${name}" creation failed. ${request.responseText}`, 'warning'); }
    );
    return false;
  }

  function updateCredentials(){
    let password = $('#password').val();
    post('/api/credentials/update', {password},
      () => {
        showToast('Credential update successful', 'success');
        $('#password').val('');
      },
      () => { showToast('Credential update failed', 'warning'); }
    );
    return false;
  }

  function showToast(title, message, kind){
    if(kind === undefined){ kind = message; message = title; title = ''; }
    toastr[kind](message, title);
  }

  function createAddNewButton(){
    let addnew = $('<tr id="envlist_addnew"><td colspan="3"><button class="btn btn-default form-control">add new</button>');
    addnew.find('button').click(function(){
      $('#envlist_addnew').remove();
      $('#envlist').append(createEnvRow()).append(createAddNewButton());
      return false;
    });
    return addnew;
  }

  function createEnvRow(name, value){
    let row = $('<tr data-env="env-item"/>');
    row.append($('<td><input class="form-control" name="env-name" /></td>'));
    row.append($('<td><input class="form-control" name="env-value" /></td>'));
    row.append($('<td><button class="btn btn-danger form-control"><span class="glyphicon glyphicon-trash" /></button></td>'));
    row.find('input[name="env-name"]').val(name || '');
    row.find('input[name="env-value"]').val(value || '');
    row.find('button').click(()=>{ row.remove(); return false; });
    return row;
  }

  function setClassForFlag(element, flagName, trueOrFalse){
    element.removeClass(flagName[+!trueOrFalse])
      .addClass(flagName[+!!trueOrFalse]);
  }

  function load(){
    $('#newform').submit(createNew);
    $('#credentialform').submit(updateCredentials);
    $('#service_name').keyup(function(){
      if($('#service_name').val() === ''){
        clearValidation();
      }else{
        let state = $('#service_name').val().match(ContainerRegexp);
        setClassForFlag($('#service_name_group'), nameFlags, state);
        setClassForFlag($('#service_name_glyph'), glyphFlags, state);
      }
    });
    $('#external_repo').keyup(function(){
      $('#template').prop('disabled', $('#external_repo').val() !== '');
    });
    $('#env_save').click(function(){
      let items = $('#envlist tr[data-env="env-item"]').toArray();
      let env = JSON.stringify(items.map(i => [
          $(i).find('input[name="env-name"]').val(),
          $(i).find('input[name="env-value"]').val()
        ])
        .reduce((pr, cr) => { pr[cr[0]] = cr[1]; return pr; }, {}));
      let name = $('#target_service').val();
      post(`/api/services/${name}/env/update`, {env},
        () => showToast('Env updated!', 'success'),
        () => showToast('Env update failed', 'warning')
      );
    });
  }

  $(function(){
    // congirue toastr
    toastr.options.closeButton = true;
    toastr.options.progressBar = true;
    // load components
    load();
  })

  return {
    get, put, post, del, createEnvRow, createAddNewButton
  };
})();

function showEnvConfig(name){
  // clear
  $('#envlist').children().remove();
  $('#envlist').append($('<thead><tr><th>name</th><th>value</th></tr></thead>'));
  $('#target_service').val(name);
  Internal.get(`/api/services/${name}/env`, {}, json=>{
    let env = JSON.parse(json);
    // add trailing button
    Object.keys(env).reduce((pr, cr) => pr.append(Internal.createEnvRow(cr, env[cr])), $('#envlist'));
    $('#envlist').append(Internal.createAddNewButton());
    $('#envconfig_frame').modal();
  });
}

function showLogs(name){
  Internal.get(`/api/services/${name}/logs`, {}, logs=>{
    $('#logs').val(logs);
    $('#logs_frame').modal();
  });
}

function initializeSocket(cb){
  const socket = io('/status');
  socket.on('statuses', cb);
  return cookie => socket.emit('fetch', cookie);
}

