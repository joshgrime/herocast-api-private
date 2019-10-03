const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const randomstring = require("randomstring");

module.exports = {
  main: async function (event, context) {
    
    var userid = event.pathParameters.userid;

    var discordCode = randomstring.generate({
        length: 11,
        charset: 'alphanumeric'
    });

    const params = {
      TableName: 'users',
      Key: {
        id: userid
      },
      UpdateExpression: 'SET #dc = :x',
      ExpressionAttributeNames: {
        '#dc' : 'discordcode'
      },
      ExpressionAttributeValues: {
        ':x' : discordCode
      }
    };
    try {
      await dynamoDbLib.call("update", params);
      return response.success({status: true, code: discordCode});
    } catch (e) {
      return response.failure({ status: false});
    }
  }
}