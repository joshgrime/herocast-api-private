const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var slotid = event.pathParameters.slotid;
    var hostid = event.pathParameters.hostid;

    const params = {
        TableName: 'gameslots',
        Key: {
            id: slotid,
            hostid: hostid
        }
    };

    try {
      var slot = await dynamoDbLib.call("get", params);
      console.log(slot.Item);
      if (slot.Item === undefined) return response.failure({status:false, data: 'Couldn\'t find gameslot.'});
      if (hostid !== slot.Item.hostid) return response.failure({status: false, data: 'This is not your gameslot.'});

        if (slot.Item.status === 'disputed') {
            var updateParam = {
                TableName: 'gameslots',
                Key: {
                    id: slotid,
                    hostid: hostid
                },
                UpdateExpression: 'SET #s = :ns',
                ExpressionAttributeNames: {
                    '#s' : 'status'
                },
                ExpressionAttributeValues : {
                    ':ns' : 'review'
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