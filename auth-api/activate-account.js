const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

    const params = {
      "TableName": "users",
      "Key": {
          "id":postbody.userid
      },
      "ProjectionExpression": "enabled, emailcode, email"
    }
    try{
      var user = await dynamoDbLib.call("get", params);
      console.log(user);
    if (user.Item.enabled !== 1) {
      if ((user.Item.emailcode == postbody.code) && (user.Item.email == postbody.email)) {

        const updateParams = {
          TableName: 'users',
          Key: {
            id: postbody.userid
          },
          UpdateExpression: 'SET #ec = :ecc, #en = :enn',
          ExpressionAttributeNames: {
            '#ec' : 'emailcode',
            '#en' : 'enabled'
          },
          ExpressionAttributeValues: {
            ':ecc' : '0',
            ':enn' : 1
          }
        };
        await dynamoDbLib.call("update", updateParams);

        return response.success({status: true});
      }
      else {
        return response.failure({status: false});
      }
    }
    else {
      return response.failure({status: false, error: 'already enabled'});
    }
  }
      catch (e) {
      console.log("Big error");
      console.log(e);
      return response.failure({ status: false });
    }
  }
}