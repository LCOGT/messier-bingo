/* globals $ rivetsBindings rivets apiRoot refreshTable */
'use strict';

var apiRoot = 'https://observe.lco.global/api/';

// rivets.bind($('#profile'), profile);

$.ajaxPrefilter(function(options, originalOptions, jqXHR){
  if(options.url.indexOf('lco.global/') >= 0 && localStorage.getItem('token')){
    jqXHR.setRequestHeader('Authorization', 'Token ' + localStorage.getItem('token'));
  }
});

function getProposals(){
  var p;
  $.getJSON(apiRoot + 'profile/', function(data){
    for (i=0;i<data.proposals.length;i++){
      p = data.proposals[i]['id'];
      if (proposal_list.includes(p)) {
        localStorage.setItem('proposal_code', p)
        return
      }
    }
  });
}

function login(username, password, callback){
  $.post(
    apiRoot + 'api-token-auth/',
    {
      'username': username,
      'password': password
    }
  ).done(function(data){
    localStorage.setItem('token', data.token);
    getProposals();
    callback(true);
  }).fail(function(){
    console.log("Failed!")
    callback(false);
  });
}

function logout(){
  localStorage.removeItem('token');
}

function submit_to_serol(){
  var request = format_request();
  console.log(localStorage.getItem('proposal_code'));
  $.ajax({
    url: 'https://observe.lco.global/api/userrequests/',
    type: 'post',
    data: {
        'group_id': 'Submit me',
        'proposal': localStorage.getItem('proposal_code'),
        'ipp_value': 1.05,
        'operator': 'SINGLE',
        'observation_type': 'NORMAL',
        'requests': [request]
    },
    dataType: 'json',
    success: function(data){
      console.log(data);
    },
    error: function(e){
      console.log(e);
    }
});
}

function format_request(){
  var target = {
    'type': 'SIDEREAL',
    'name': 'm42',
    'ra': 83.8220792,
    'dec': -5.3911111,
  }
  var molecules = {
    'type': 'EXPOSE',
    'instrument_name': '0M4-SCICAM-SBIG',
    'filter': 'v',
    'exposure_time': 30.0,
    'exposure_count': 1,
  }
  var windows = {
    'start': '2018-11-01 14:26:08',
    'end': '2018-11-22 14:26:08'
  }

  var request = {
    'location': {'telescope_class': '0m4'},
    'constraints': {},
    'target': target,
    'molecules': [molecules],
    'windows': [windows],
    }
  return request;
}
