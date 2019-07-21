const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var slotid = event.pathParameters.slotid;
    var hostid = event.pathParameters.hostidd;

    const params = {
        TableName: 'gameslots',
        Key: {
            id: slotid,
            hostid: hostid
        }
    };

    try {
      var details = await dynamoDbLib.call("get", params);
      return response.success({status:true, data: details.Item});
    } catch (e) {
      console.log('Big error!');
      console.log(e);
      return response.failure({ status: false, error: e });
    }
  }
}