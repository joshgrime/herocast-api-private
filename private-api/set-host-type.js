const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

    var coach = postbody.coach ? 1 : 0;
    var casual = postbody.casual ? 1 : 0;
    var vs = postbody.vs ? 1 : 0;

    const params = {
      TableName: 'users',
      Key: {
        id: postbody.id
      },
      UpdateExpression: 'SET #codp = :x, #cadp = :y, #vsdp = :z',
      ExpressionAttributeNames: {
        '#codp' : 'casual',
        '#cadp' : 'coach',
        '#vsdp' : 'vs',
      },
      ExpressionAttributeValues: {
        ':x' : casual,
        ':y' : coach,
        ':z' : vs,
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