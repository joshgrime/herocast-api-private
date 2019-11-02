const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

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
            ':avUrl': null,
            ':tname': null,
            ':tauth': 0
        }
        }; 

    try {   
        var success = await dynamoDbLib.call('update', twitchParams);
        return response.success({status: true});
      
    } catch (e) {
      return response.failure({ status: false, errorMessage: e });
    }
  }
}