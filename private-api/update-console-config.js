const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);
    const params = {
      TableName: 'users',
      Key: {
        id: postbody.id
      },
      UpdateExpression: 'SET #c = :x',
      ExpressionAttributeNames: {
        '#c' : 'console'
      },
      ExpressionAttributeValues: {
        ':x' : postbody.console
      }
    };
    try {
      await dynamoDbLib.call("update", params);
      return response.success({status: true});
    } catch (e) {
      return response.failure({ status: false });
    }
  }
}