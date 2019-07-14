const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const cryptojs = require("crypto-js");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

        const params1 = {
            TableName: 'salts',
            Key: {
                id: postbody.id
            }
        }

        const params2 = {
            "TableName": "users",
            "Key": {
                "id":postbody.id
            },
            "ProjectionExpression": "password"
        }
      try{
      var salt = await dynamoDbLib.call("get", params1);
      var user = await dynamoDbLib.call("get", params2);
      //decrypt password
      var bytes  = cryptojs.AES.decrypt(user.Item.password, salt.Item.salt);
      var unhashedpass = bytes.toString(cryptojs.enc.Utf8);
      //check the password matches
      if (unhashedpass !== postbody.oldPassword) return response.failure({ status: false, errorMessage:'Incorrect password' });
      else {
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
      return response.success({ status: true});
    }
    } catch (e) {
      console.log("Big error");
      console.log(e);
      return response.failure({ status: false });
    }
  }
}