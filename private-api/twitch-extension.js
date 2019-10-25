const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var twitchid = event.pathParameters.twitchid;
    const params = {
        "TableName": "twitch-ext",
        "Key": {
            "twitchid": twitchid
        },
        "ProjectionExpression": "username, id"
    }

    try {

    var user = await dynamoDbLib.call("get", params);

    const params2 = {
        "TableName": "users",
        "Key": {
            id: user.Item.id
        },
        "ProjectionExpression": "games, coach, casual, vs, console, displayName, #lvl",
        "ExpressionAttributeNames": {
          "#lvl":"level"
        }
      };
      var user_data = await dynamoDbLib.call("get", params2);
      user_data.Item['id'] = user.Item.id;
      return response.success({status:true, data: user_data.Item});
    } catch (e) {
      console.log('Big error!');
      console.log(e);
      return response.failure({ status: false, error: e });
    }
  }
}