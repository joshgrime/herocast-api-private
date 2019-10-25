const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const uuidv1 = require('uuid/v1');

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

    if (postbody.times.length > 25) return response.failure({status: false, errorMessage: 'You may only set a maximum of 25 times at once.'});

    var date = new Date();
    var y = date.getUTCFullYear().toString();
    var m = date.getUTCMonth() + 1;
    m = m.toString();
    var d = date.getUTCDate().toString();
    var h = date.getUTCHours().toString();
    var mi = date.getUTCMinutes().toString();

    if (m.length<2) m = '0'+m;
    if (d.length<2) d = '0'+d;
    if (h.length<2) h = '0'+h;
    if (mi.length<2) mi = '0'+mi;
    var today = parseInt(y+m+d);
    var timeNow = parseInt(h+mi);

    if (today > parseInt(postbody.date)) return response.failure({status: false, errorMessage: 'You cannot set a game slot in the past'});

    const checkParams = {
      TableName: 'users',
      Key: {
        id: postbody.hostid
      }
    };

    try {
      var user = await dynamoDbLib.call('get', checkParams);

      if (user.Item.host != 1) return response.failure({status: false, errorMessage: 'You must be a host to add game times'});
      if (user.Item.twitchAuthed != 1) return response.failure({status:false, errorMessage: 'You must authenticate your Twitch account first.'});
      if (user.Item.games === null || user.Item.games === undefined || user.Item.games === '') return response.failure({status: false, errorMessage: 'You must select games before creating gameslots'});
      if (user.Item.console === null || user.Item.console === undefined || user.Item.console === '') return response.failure({status: false, errorMessage: 'You must select your console before creating gameslots'});

      const params = {
        RequestItems: {
          "gameslots": []
        }
      }

      var locale = user.Item.locale;

      var datea = (function(d){
        var year = d.slice(0,4);
        var month = d.slice(4,6);
        var day = d.slice(6,8);
        return year+'-'+month+'-'+day;
      })(postbody.date);

      for (let y of postbody.times) {
        var x = y.time;
        let insert = true;
        if (today == postbody.date) {
          if (timeNow > parseInt(x)) insert = false;
        }
        if (insert) {
          let id = uuidv1();
          var time = (function(t){
            var hour = t.slice(0,2);
            var mins = t.slice(2,4);
            return hour+':'+mins+':00';
          })(x);
        var ime = new Date(datea+'T'+time);
        var __time = ime.getTime()/1000;

        var localtime = y.local;

          let obj = {
            PutRequest: {
              Item: {
                "id":id,
                "hostid": postbody.hostid,
                "hostusername":user.Item.username,
                "hostdisplayname":user.Item.displayName,
                "console":user.Item.console,
                "coachprice":postbody.coachprice,
                "casualprice":postbody.casualprice,
                "vsprice":postbody.vsprice,
                "booked":0,
                "time":x,
                "date": postbody.date,
                "locale": locale,
                "status": 'open',
                "timedex": __time,
                "localtime": localtime
              }
            }
          }
          params.RequestItems.gameslots.push(obj);
        }
      }
      var write = await dynamoDbLib.call("batchWrite", params);
      return response.success({status:true});
    } catch (e) {
      console.log('Big error!');
      console.log(e);
      return response.failure({ status: false });
    }
  }
}