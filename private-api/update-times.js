const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const uuidv1 = require('uuid/v1');

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

    if (postbody.times.length > 25) return response.failure({status: false, errorMessage: 'You may only set a maximum of 25 times at once.'});

    const checkParams = {
      TableName: 'users',
      Key: {
        id: postbody.hostid
      }
    };

    try {
      var user = await dynamoDbLib.call('get', checkParams);

      if (user.host !== 1) return response.failure({status: false, errorMessage: 'You must be a host to add game times'});
      if (user.twitchAuthed !==1) return response.failure({status:false, errorMessage: 'You must authenticate your Twitch account first.'});
      if (user.games === null || user.games === '') return response.failure({status: false, errorMessage: 'You must select games before creating gameslots'});
      if (user.console === null || user.console === '') return response.failure({status: false, errorMessage: 'You must select your console before creating gameslots'});

      const params = {
        RequestItems: {
            "gameslots": []
        }
      }

      for (let x of postbody.times) {
        let id = uuidv1();
        let obj = {
          PutRequest: {
            Item: {
              "id":id,
              "hostid": postbody.hostid,
              "console":user.console,
              "coachprice":postbody.coachprice,
              "casualprice":postbody.casualprice,
              "vsprice":postbody.vsprice,
              "booked":0,
              "time":x
            }
          }
        }
        params.RequestItems.gameslots.push(obj);
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