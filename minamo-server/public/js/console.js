function rootDomain(){
  return window.location.hostname;
}

function removeHandler(name){
  return function(){
    if(window.confirm('This container permanently removed. Are you sure?')){
      $.get('/api/destroy', {'service': name, 't': Date.now()}, function(){
        updateStatus();
      });
    }
  }
}

function createNew(){
  var name = document.new_container.service.value;
  var template = document.new_container.template.value;
  if(!name.match(/^[a-z0-9-]+$/)){
    $('#errmsg').text('error: service name should be [a-z0-9-]+');
    return false;
  }
  $.get('/api/create', {'service': name, 'template': template, 't': Date.now()}, function(){
    document.new_container.service.value = "";
    updateStatus();
  });
  return false;
}

function updateCredentials(){
  $.post('/api/credentials/update', {'password': $('#password').val()}, function(){
    
  });
  return false;
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
  if(isRunning(text)) return 'label-success';
  if(isPrepareing(text)) return 'label-info';
  if(isStopping(text)) return 'label-warning';
  if(isStopped(text)) return 'label-danger';
}

function startContainer(name){
  return function(){
    $.get('/api/start', {'service': name, 't': Date.now()}, function(){
      updateStatus();
    });
    return false;
  }
}

function stopContainer(name){
  return function(){
    $.get('/api/stop', {'service': name, 't': Date.now()}, function(){
      updateStatus();
    });
    return false;
  }
}

function restartContainer(name){
  return function(){
    $.get('/api/restart', {'service': name, 't': Date.now()}, function(){
      updateStatus();
    });
    return false;
  }
}

function actionButton(name, status){
  var dom = new Dom();
  var action = $('<div></div>').addClass('btn-group');
  var actions = $('<ul></ul>').addClass('dropdown-menu');
  action
    .append($('<button></button>', {'data-toggle':'dropdown', 'class':'btn dropdown-toggle'}).text('Action ')
      .append($('<span>').addClass('caret')))
    .append(actions);
  if(isRunning(status)){
    actions
      .append($('<li>').append(dom.a('stop', '#', stopContainer(name))))
      .append($('<li>').append(dom.a('restart', '#', restartContainer(name))))
  }else if(isStopped(status)){
    actions
      .append($('<li>').append(dom.a('start', '#', startContainer(name))))
  }
  return action;
}

function updateStatus(){
  $.get('/api/status', {'t': Date.now()}, function(json){
    var dom = new Dom();
    var table = $('<table></table>').addClass('table table-hover')
      .append($('<tr></td>')
        .append(dom.th('name'))
        .append(dom.th('status'))
        .append(dom.th('head'))
        .append(dom.th('uptime'))
        .append(dom.th('repo'))
        .append(dom.th('action'))
        .append(dom.th('remove'))
    );
    var div = $('#statuses_xs');div.children().remove();
    var keys = Object.keys(json);
    // build non xs
    for(var i = 0; i < keys.length; ++i){
      var cont = json[keys[i]];
      var status = cont.status;
      var created = cont.created ? new Date(cont.created).toLocaleString() : "";
      table.append($('<tr>')
        .append($('<td>').append(dom.a(keys[i], '//' + keys[i] + '.' + rootDomain())))
        .append($('<td>').append($('<span class="label" />').text(status).addClass(toLabelColor(status))))
        .append($('<td>').text(cont.head))
        .append($('<td>').append($('<span>',{'data-toggle':'tooltip',title:created}).text(cont.uptime).tooltip()))
        .append($('<td>').append($('<input>').addClass('form-control').val('http://git.' + rootDomain() + '/' + keys[i] + '.git')))
        .append($('<td>').append(actionButton(keys[i], status)))
        .append($('<td>').append($('<button>', {'class': 'btn btn-danger'}).text('remove').click(removeHandler(keys[i]))))
      );
      // xs panel
      var panel = $('<div class="panel-group"></div>');
      var panel2 = $('<div class="panel panel-default"></div>');
      panel.append(panel2);
      panel2.append($('<div class="panel-heading" data-toggle="collapse"></div>').attr('href', '#svc_' + keys[i])
        .append($('<div class="row" data-toggle="collapse"></div>')
          .append($('<div class="col-xs-6"></div>')
            .append($('<h4 class="panel-title visible-xs-inline"></h4>').text(keys[i])))
          .append($('<div class="col-xs-6 text-right"></div>')
            .append($('<p class="label vcenter text-right"></p>').text(status).addClass(toLabelColor(status))))));
      panel2.append($('<div class="panel-collapse collapse"></div>').collapse('hide').attr("id",'svc_'+keys[i])
        .append($('<div class="panel-body"></div>')
          .append($('<dl class="dl-horizontal"></dl>')
            .append($('<dt>').text('service'))
            .append($('<dd>').append(dom.a(keys[i] + '.' + rootDomain(), '//' + keys[i] + '.' + rootDomain())))
            .append($('<dt>').text('head'))
            .append($('<dd>').text(cont.head))
            .append($('<dt>').text('uptime'))
            .append($('<dd>').append($('<span>',{'data-toggle':'tooltip',title:created}).text(cont.uptime).tooltip()))
            .append($('<dt>').text('repo'))
            .append($('<dd>').append($('<input>').addClass('form-control').val('http://git.' + rootDomain() + '/' + keys[i] + '.git'))))
          .append(actionButton(keys[i], status))
          .append(' ')
          .append($('<button>', {'class': 'btn btn-danger'}).text('remove').click(removeHandler(keys[i])))));
      div.append(panel);
    }
    $('#statuses').children().remove();
    $('#statuses').append(table);
  });
}

function load(){
  updateStatus();
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
}

$(document).ready(function(){
  load();
})
