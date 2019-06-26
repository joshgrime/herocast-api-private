const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var hostid = event.pathParameters.id;
    var date = event.pathParameters.date;

    const params = {
      "TableName": "gameslots",
      "IndexName": "hostid-date-index",
      "KeyConditionExpression": "#hostid = :h and #date = :d",
      ExpressionAttributeNames: {
        "#hostid":"hostid",
        "#date": "date"
      },
      ExpressionAttributeValues: {
          ":h": hostid,
          ":d": date
      }
    };

    try {
      var times = await dynamoDbLib.call("query", params);
      console.log(times);
      return response.success({status:true, times: times.Items});
    } catch (e) {
      console.log('Big error!');
      console.log(e);
      return response.failure({ status: false });
    }
  }
}