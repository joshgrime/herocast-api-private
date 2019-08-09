const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const moment = require('moment');

module.exports = {
  main: async function (event, context) {

    var postbody = JSON.parse(event.body);

    const params = {
        TableName: 'gameslots',
        Key: {
            id: postbody.slotid,
            hostid: postbody.hostid
        }
    };

    try {
      var slot = await dynamoDbLib.call("get", params);
      console.log(slot.Item);
      if (slot.Item === undefined) return response.failure({status:false, data: 'Couldn\'t find gameslot.'});
      if (postbody.userid !== slot.Item.playerid) return response.failure({status: false, data: 'This is not your gameslot.'});


        var a = moment(event.time);
        var minute = a.minute();

        if (slot.Item.status === 'live' && (minute <= 15 || (minute >= 30 && minute <= 45))) {
            var updateParam = {
                TableName: 'gameslots',
                Key: {
                    id: postbody.slotid,
                    hostid: postbody.hostid
                },
                UpdateExpression: 'SET #s = :ns',
                ExpressionAttributeNames: {
                    '#s' : 'status'
                },
                ExpressionAttributeValues : {
                    ':ns' : 'disputed'
                }
              };
            await dynamoDbLib.call("update", updateParam);
            return response.success({status:true});
        }
        else {
            return response.failure({status:false, data: 'This gameslot has been live for longer than 15 minutes.'});
      }

    } catch (e) {
      console.log('Big error!');
      console.log(e);
      return response.failure({ status: false });
    }
  }
}