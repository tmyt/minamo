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

function startContainer(name){
  return function(){
    $.get('/api/start', {'service': name}, function(){
      updateStatus();
    });
    return false;
  }
}

function stopContainer(name){
  return function(){
    $.get('/api/stop', {'service': name}, function(){
      updateStatus();
    });
    return false;
  }
}

function restartContainer(name){
  return function(){
    $.get('/api/restart', {'service': name}, function(){
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
  }else{
    actions
      .append($('<li>').append(dom.a('start', '#', startContainer(name))))
  }
  return action;
}

function updateStatus(){
  $.get('/api/status', function(json){
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
        .append($('<td>').append($('<span class="label" />').text(status).addClass(isRunning(status)?'label-success':'label-danger')))
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
      panel2.append($('<div class="panel-heading"></div>')
        .append($('<h4 class="panel-title visible-xs-inline"></h4>')
          .append($('<a data-toggle="collapse"></a>').attr('href','#svc_'+keys[i]).text(keys[i])))
        .append(' ')
        .append($('<p class="label vcenter"></p>').text(status).addClass(isRunning(status)?'label-success':'label-danger')));
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
