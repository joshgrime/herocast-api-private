const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

    const params = {
        "TableName": "users",
        "Key": {
            "id":postbody.id
        },
        "ProjectionExpression": "coins"
    }

    try {
      var currentCoins = await dynamoDbLib.call("get", params);

      //make stripe call here

        var newCoins = currentCoins.Item.coins + postbody.coins;

        var newWealthParams = {
        TableName: 'users',
        Key: {
            id: postbody.id
        },
        UpdateExpression: 'SET #c = :nw',
        ExpressionAttributeNames: {
            '#c' : 'coins'
        },
        ExpressionAttributeValues: {
            ':nw': newCoins
        }
        }; 
        
        var coins = await dynamoDbLib.call('update', newWealthParams);
        return response.success({status: true});
      
    } catch (e) {
      return response.failure({ status: false, errorMessage: e });
    }
  }
}