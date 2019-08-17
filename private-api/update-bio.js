const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    
    var postbody = JSON.parse(event.body);
    
    var userid = postbody.id;
    var bio = postbody.data;

    const params = {
      TableName: 'users',
      Key: {
        id: userid
      },
      UpdateExpression: 'SET #g = :x',
      ExpressionAttributeNames: {
        '#g' : 'bio'
      },
      ExpressionAttributeValues: {
        ':x' : bio
      }
    };
    try {
      await dynamoDbLib.call("update", params);
      return response.success({status: true});
    } catch (e) {
      return response.failure({ status: false});
    }
  }
}