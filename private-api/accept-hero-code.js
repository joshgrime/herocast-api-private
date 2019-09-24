const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var id = event.pathParameters.id;
    const params = {
      TableName: 'users',
      Key: {
        id: id
      },
      UpdateExpression: 'SET #hc = :x',
      ExpressionAttributeNames: {
        '#hc' : 'herocode'
      },
      ExpressionAttributeValues: {
        ':x' : 1
      }
    };
    try {
      await dynamoDbLib.call("update", params);
      return response.success(params.Item);
    } catch (e) {
      return response.failure({ status: false });
    }
  }
}