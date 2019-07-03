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
        "ProjectionExpression": "email"
    }

    try {
      var user = await dynamoDbLib.call("get", params);
      
      if (user.Item.email !== postbody.email) return response.failure({status:false});

        var twitchParams = {
        TableName: 'users',
        Key: {
            id: postbody.id
        },
        UpdateExpression: 'SET #ta = :avUrl, #tn = :tname, #twa = :tauth',
        ExpressionAttributeNames: {
            '#ta' : 'twitchAvatar',
            '#tn' : 'twitchName',
            '#twa': 'twitchAuthed'

        },
        ExpressionAttributeValues: {
            ':avUrl': postbody.avatar,
            ':tname': postbody.twitchName,
            ':tauth':1
        }
        }; 
        
        var success = await dynamoDbLib.call('update', twitchParams);
        return response.success({status: true});
      
    } catch (e) {
      return response.failure({ status: false, errorMessage: e });
    }
  }
}