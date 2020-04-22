const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const randomstring = require("randomstring");
const AWS = require("aws-sdk");


module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

    const params = {
        "TableName": "users",
        "IndexName": "email-index",
        "KeyConditionExpression": "email = :e",
        "ExpressionAttributeValues": {
          ":e":postbody.email
        }
      }
  
      try{
  
      var user = await dynamoDbLib.call("query", params);
  
      if (user.Items.length===0) return response.failure({status:false, errorMessage: 'No users found'});

      var resetPasswordCode = randomstring.generate({
        length: 32,
        charset: 'alphanumeric'
        });

        var d = new Date();
        var timestamp = d.getTime();
        timestamp += (3600000 * 2) //2 hours

      const updateParams = {
        TableName: 'users',
        Key: {
          id: user.Items[0].id
        },
        UpdateExpression: 'SET #rpc = :rpc, #rts = :rts',
        ExpressionAttributeNames: {
          '#rpc' : 'resetPasswordCode',
          '#rts': 'resetPassTimestamp'
        },
        ExpressionAttributeValues: {
          ':rpc' : resetPasswordCode,
          ':rts' : timestamp
        }
      };
      await dynamoDbLib.call("update", updateParams);

        var SNSmsg = {
          email:postbody.email,
          code:resetPasswordCode
      }

      var eventText = JSON.stringify(SNSmsg);
      var sns = new AWS.SNS();
      var SNSparams = {
        Message: eventText,
        TopicArn: "arn:aws:sns:eu-west-1:163410335292:ResetPasswordRequest"
      };
      
        await sns.publish(SNSparams).promise();

        return response.success({status: true});
  }
      catch (e) {
      console.log("Big error");
      console.log(e);
      return response.failure({ status: false });
    }
  }
}