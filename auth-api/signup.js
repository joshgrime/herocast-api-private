const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const cryptojs = require("crypto-js");
const uuidv1 = require('uuid/v1');
const randomstring = require("randomstring");

module.exports = {
  main: async function (event, context) {
    
    var postbody = JSON.parse(event.body);

    const checkParams = {
      "TableName": "users",
      "IndexName": "email-index",
      "KeyConditionExpression": "email = :e",
      "ExpressionAttributeValues": {
        ":e":postbody.email
      }
    }

    var checkIfExists = await dynamoDbLib.call("query", checkParams)

    if (checkIfExists.Items.length===0) {

      var passSalt = randomstring.generate({
        length: 64,
        charset: 'alphanumeric'
    });

    var passHash = cryptojs.AES.encrypt(postbody.password, passSalt).toString();
    var id = uuidv1();

    console.log(id);
    console.log(passHash);

    const params = {
        "TableName": 'users',
        "Item": {
            "id": id,
            "email": postbody.email,
            "password": passHash,
            "username": postbody.username,
            "level":0,
            "exp":0,
            "coins":0,
            "host": postbody.host
        }
    }

    if (postbody.host === 1) {
        params.Item['vs'] = postbody.vs ? 1 : 0;
        params.Item['coach'] = postbody.coach ? 1 : 0;
        params.Item['casual'] = postbody.casual ? 1 : 0;
    }
    try {
      
      var epic = await dynamoDbLib.call("put", params);

        const params2 = {
          TableName: 'salts',
          Item: {
            "id":id,
            "salt":passSalt
          }
        }

        var saltwrite = await dynamoDbLib.call("put", params2);

        console.log(saltwrite);
        return response.success({status: true});

    } catch (e) {
      console.log('BIG ERROR');
      console.log(e);
        return response.failure({ status: false, errorMessage: e });
      }

    } else {
      return response.failure({status:false, errorMessage: 'Email already exists'});
    }

    }
}