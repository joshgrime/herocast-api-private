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
      UpdateExpression: 'SET #codp = :x, #cadp = :y, #vsdp = :z',
      ExpressionAttributeNames: {
        '#codp' : 'casual_default_price',
        '#cadp' : 'coach_default_price',
        '#vsdp' : 'vs_default_price',
      },
      ExpressionAttributeValues: {
        ':x' : postbody.casual,
        ':y' : postbody.coach,
        ':z' : postbody.vs,
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