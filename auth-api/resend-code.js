const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const randomstring = require("randomstring");
var AWS = require("aws-sdk");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

    const params = {
      "TableName": "users",
      "Key": {
          "id": postbody.userid
      },
      "ProjectionExpression": "enabled, emailcode, email"
    }
    try{

    var user = await dynamoDbLib.call("get", params);
    
    if (user.Item.enabled !== 1) {
      
      var emailCode = randomstring.generate({
        length: 32,
        charset: 'alphanumeric'
    });

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
        ':ecc' : emailCode,
        ':enn' : 0
      }
    };
    await dynamoDbLib.call("update", updateParams);
    var SNSmsg = {
      code:emailCode,
      email:user.Item.email,
  }

    var eventText = JSON.stringify(SNSmsg);
    var sns = new AWS.SNS();
    var SNSparams = {
    Message: eventText,
    TopicArn: "arn:aws:sns:eu-west-1:163410335292:newSignUp"
    };

    await sns.publish(SNSparams).promise();
    return response.success({status: true});

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