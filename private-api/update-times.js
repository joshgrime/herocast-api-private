const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const uuidv1 = require('uuid/v1');

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

    if (postbody.times.length > 25) return response.failure({status: false, errorMessage: 'You may only set a maximum of 25 times at once.'});

    var date = new Date();
    var y = date.getFullYear().toString();
    var m = date.getMonth() + 1;
    m = m.toString();
    var d = date.getDate().toString();
    var h = date.getHours().toString();
    var mi = date.getMinutes().toString();
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
  
      for (let x of postbody.times) {
        let insert = true;
        if (today == postbody.date) {
          if (timeNow > parseInt(x)) insert = false;
        }
        if (insert) {
          let id = uuidv1();
          let obj = {
            PutRequest: {
              Item: {
                "id":id,
                "hostid": postbody.hostid,
                "console":user.Item.console,
                "coachprice":postbody.coachprice,
                "casualprice":postbody.casualprice,
                "vsprice":postbody.vsprice,
                "booked":0,
                "time":x,
                "date":postbody.date,
                "locale": locale,
                "status": 'open'
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