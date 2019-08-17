const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    
    var postbody = JSON.parse(event.body);
    
    var userid = postbody.userid;
    var url = postbody.url;

    const params = {
      TableName: 'users',
      Key: {
        id: userid
      },
      UpdateExpression: 'SET #g = :x',
      ExpressionAttributeNames: {
        '#g' : 'avatar'
      },
      ExpressionAttributeValues: {
        ':x' : url
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