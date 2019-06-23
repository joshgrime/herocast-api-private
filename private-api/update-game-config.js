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
      UpdateExpression: 'SET #g = :x',
      ExpressionAttributeNames: {
        '#g' : 'games'
      },
      ExpressionAttributeValues: {
        ':x' : postbody.games.toString()
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