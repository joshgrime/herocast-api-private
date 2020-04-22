const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const cryptojs = require("crypto-js");
const AWS = require("aws-sdk");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

    try{
    if (postbody.id === undefined && postbody.email === undefined) return response.failure({status: false, errorMessage: 'No email or ID provided.'})

    var userId;

    if (postbody.id) {
      userId = postbody.id;
    }
    else {
      const initParam = {
        "TableName": "users",
        "IndexName": "email-index",
        "KeyConditionExpression": "email = :e",
        "ExpressionAttributeValues": {
          ":e":postbody.email
        }
      }

      var userIdDetails = await dynamoDbLib.call("query", initParam);
      if (userIdDetails.Items.length === 0) return response.failure({status: false, errorMessage: 'No player found'});
      userId = userIdDetails.Items[0].id;
    }

    const params1 = {
      TableName: 'salts',
      Key: {
          id: userId
      }
    }

  const params2 = {
      "TableName": "users",
      "Key": {
          "id":userId
      },
      "ProjectionExpression": "password, resetPasswordCode, resetPassTimestamp"
    }

      var salt = await dynamoDbLib.call("get", params1);
      var user = await dynamoDbLib.call("get", params2);

      console.log('USER ID IS '+userId);
      console.log('USER ID IS '+user.Item);


      if (postbody.reset) {
        var date = new Date();
        var d = date.getTime();
        if (postbody.code !== user.Item.resetPasswordCode || d > user.Item.resetPassTimestamp) return response.failure({ status: false, errorMessage:'Code invalid.'});
      }
      else {
        //decrypt password
        var bytes  = cryptojs.AES.decrypt(user.Item.password, salt.Item.salt);
        var unhashedpass = bytes.toString(cryptojs.enc.Utf8);
        //check the password matches
        if (unhashedpass !== postbody.oldPassword) return response.failure({ status: false, errorMessage:'Incorrect password' });
      }

        console.log('Passwords match!');


      var newEncryptedPassword = cryptojs.AES.encrypt(postbody.newPassword, salt.Item.salt).toString();

      const updateParams = {
        TableName: 'users',
        Key: {
          id: postbody.id
        },
        UpdateExpression: 'SET #p = :x',
        ExpressionAttributeNames: {
          '#p' : 'password'
        },
        ExpressionAttributeValues: {
          ':x' : newEncryptedPassword
        }
      };

      var success = await dynamoDbLib.call("update", updateParams);

        var SNSmsg = {
          email:postbody.email
      }

      var eventText = JSON.stringify(SNSmsg);
      var sns = new AWS.SNS();
      var SNSparams = {
        Message: eventText,
        TopicArn: "arn:aws:sns:eu-west-1:163410335292:UpdatedPassword"
      };
      
      await sns.publish(SNSparams).promise();

      return response.success({ status: true});
    } catch (e) {
      console.log("Big error");
      console.log(e);
      return response.failure({ status: false, error: e });
    }
  }
}