const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var id = event.pathParameters.id;

    const params = {
        "TableName": "users",
        "Key": {
            "id":id
        },
        "ProjectionExpression": "id, host, games, #lvl, twitchAuthed, twitchName, twitchAvatar, coach, casual, vs, console, exp, email, username, displayName, coins, locale, avatar",
        "ExpressionAttributeNames": {
          "#lvl":"level"
        }
    }


    try {
      var payload = await dynamoDbLib.call("get", params);
      return response.success({status:true, data: payload.Item});
    } catch (e) {
      console.log('Big error!');
      console.log(e);
      return response.failure({ status: false, error: e });
    }
  }
}