const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const cryptojs = require("crypto-js");
const uuidv1 = require('uuid/v1');
const randomstring = require("randomstring");
var AWS = require("aws-sdk");

module.exports = {
  main: async function (event, context) {
    
    var postbody = JSON.parse(event.body);

    try {
    const checkEmailParams = {
      "TableName": "users",
      "IndexName": "email-index",
      "KeyConditionExpression": "email = :e",
      "ExpressionAttributeValues": {
        ":e":postbody.email
      }
    }

    var checkIfEmailExists = await dynamoDbLib.call("query", checkEmailParams);

    if (checkIfEmailExists.Items.length>0) return response.failure({status:false, errorMessage: 'Email already exists'});

    var normalisedUsername = postbody.username.toLowerCase();

    const checkUserNameParams = {
      "TableName": "users",
      "IndexName": "username-index",
      "KeyConditionExpression": "username = :u",
      "ExpressionAttributeValues": {
        ":u": normalisedUsername
      }
    }

    var checkIfUsernameExists = await dynamoDbLib.call("query", checkUserNameParams);

    if (checkIfUsernameExists.Items.length>0) return response.failure({status:false, errorMessage: 'Username taken'});

      var passSalt = randomstring.generate({
        length: 64,
        charset: 'alphanumeric'
    });

    var emailCode = randomstring.generate({
      length: 32,
      charset: 'alphanumeric'
  });

    var passHash = cryptojs.AES.encrypt(postbody.password, passSalt).toString();
    var id = uuidv1();

    const params = {
        "TableName": 'users',
        "Item": {
            "id": id,
            "email": postbody.email,
            "password": passHash,
            "username": normalisedUsername,
            "displayName": postbody.username,
            "level": 1,
            "exp": 0,
            "coins": 0,
            "host": postbody.host,
            "locale": postbody.locale,
            "emailcode": emailCode,
            "enabled": 0
        }
    }

    if (postbody.host === 1) {
        params.Item['vs'] = postbody.vs ? 1 : 0;
        params.Item['coach'] = postbody.coach ? 1 : 0;
        params.Item['casual'] = postbody.casual ? 1 : 0;
        params.Item['twitchAuthed'] = 0;
        params.Item['console'] = postbody.console;
    }
      
      var epic = await dynamoDbLib.call("put", params);

        const params2 = {
          TableName: 'salts',
          Item: {
            "id":id,
            "salt":passSalt
          }
        }

        var saltwrite = await dynamoDbLib.call("put", params2);

        var SNSmsg = {
                code:emailCode,
                email:postbody.email,
            }

        var eventText = JSON.stringify(SNSmsg);
        var sns = new AWS.SNS();
        var SNSparams = {
          Message: eventText,
          TopicArn: "arn:aws:sns:eu-west-1:163410335292:newSignUp"
        };
        
        await sns.publish(SNSparams).promise();

        return response.success({status: true, id: id, username: postbody.username, host:postbody.host});

    } catch (e) {
      console.log('BIG ERROR');
      console.log(e);
        return response.failure({ status: false, errorMessage: e });
      }
  }
}