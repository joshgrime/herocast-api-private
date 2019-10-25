const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);
    const params = {
        TableName: 'twitch-ext',
        Item: {
          "twitchid":postbody.twitchid,
          "username":postbody.username,
          "id":postbody.id
        }
      }
    try{
      var user = await dynamoDbLib.call("put", params);
      console.log(user);
      return response.success({status: true});
  }
      catch (e) {
      console.log("Big error");
      console.log(e);
      return response.failure({ status: false });
    }
  }
}