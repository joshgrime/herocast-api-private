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
        "ProjectionExpression": "id, casual_default_price, coach_default_price, vs_default_price, locale",
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