const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

      var gs = (function(y){
        if (y === "") return 'NULL';
        else return y.toString();
      })(postbody.games);

    const params = {
      TableName: 'users',
      Key: {
        id: postbody.id
      },
      UpdateExpression: 'SET #g = :x',
      ExpressionAttributeNames: {
        '#g' : 'games'
      },
      ExpressionAttributeValues: {
        ':x' : gs
      }
    };
    try {
      await dynamoDbLib.call("update", params);
      return response.success({status: true});
    } catch (e) {
      return response.failure({ status: false });
    }
  }
}