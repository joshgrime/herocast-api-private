const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const cryptojs = require("crypto-js");

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

    var user = await dynamoDbLib.call("query", params)

    if (user.Items.length>1) return response.failure({status:false, errorMessage: 'More than 1 user with this email... shit'});
    if (user.Items.length===0) return response.failure({status:false, errorMessage: 'No users found'});

      var user = user.Items[0];
        const params2 = {
            TableName: 'salts',
            Key: {
                id: user.id
            }
        }

      var salt = await dynamoDbLib.call("get", params2);
      //decrypt password
      var bytes  = cryptojs.AES.decrypt(user.password, salt.Item.salt);
      var unhashedpass = bytes.toString(cryptojs.enc.Utf8);
      //check the password matches
      if (unhashedpass !== postbody.password) return response.failure({ status: false, errorMessage:'Incorrect password' });
      else {
        console.log('Passwords match!');

        const usernameParams = {
          "TableName": "users",
          "Key": {
              "id":user.id
          },
          "ProjectionExpression": "username"
      }

      var username = await dynamoDbLib.call("get", usernameParams)

        return response.success({ status: true, id:user.id, username: username.Item.username});
      } 
    } catch (e) {
      console.log("Big error");
      console.log(e);
      return response.failure({ status: false });
    }
  }
}