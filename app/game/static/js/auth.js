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

function submit_to_serol(object, start, end){
  var target = {
    "type": "SIDEREAL",
    "name": object['m'],
    "ra": object['ra'],
    "dec": object['dec']
  }
  var molecules = new Array();
  for (i=0;i<object['filters'].length;i++){
      var mol = {
              "type": "EXPOSE",
              "instrument_name": "0M4-SCICAM-SBIG",
              "filter": object['filters'][i]['name'],
              "exposure_time": object['filters'][i]['exposure'],
              "exposure_count": 1
            }
      molecules.push(mol)
  }
  var timewindow = {
    "start": start,
    "end": end
    }
  var request = {
    "location":{"telescope_class":"0m4"},
    "constraints":{"max_airmass":2.0},
    "target": target,
    "molecules": molecules,
    "windows": [timewindow],
    "observation_note" : "Serol",
    "type":"request"
  }
  var data = {
      "group_id": "mb_"+start.substr(0,10)+"_"+object['m'],
      "proposal": localStorage.getItem("proposal_code"),
      "ipp_value": 1.05,
      "operator": "SINGLE",
      "observation_type": "NORMAL",
      "requests": [request],
  }
  $.ajax({
    url: 'https://observe.lco.global/api/userrequests/',
    type: 'post',
    data: JSON.stringify(data),
    headers: {'Authorization': 'Token '+localStorage.getItem("token")},
    dataType: 'json',
    contentType: 'application/json'})
    .done(function(resp){
      var content = "<h3>Success!</h3><p>Your image will be ready in the next week.</p><img src='https://lco.global/files/edu/serol/serol_looking_though_telescope_sm.png'>"
      $('#message-content').html(content);
      $('#observe_button').hide();
      closePopup(delay='2000');
      // Stop them from accidentally submitting a second time
    })
    .fail(function(resp){
      console.log(resp);
      var content = "<h3>Error!</h3><p>Sorry, there was a problem submitting your request. Please try later.</p>"
			$('#message-content').html(content);
			closePopup(delay='2000');
    });
}
