const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const CryptoJS = require("crypto-js");
const randomstring = require("randomstring");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(JSON.stringify(event.body));

    //check the email is not taken

    const params = {
      TableName: 'users',
      Key: {
        email: postbody.email
      }
    };

    try {
      dynamoDbLib.call("get", params)
      .then(x=>{
        if (x.data.length>0) return response.failure({ status: false });
        else {

        //check the username is not taken

            const params2 = {
                TableName: 'users',
                Key: {
                    username: postbody.username
                }
            }

            dynamoDbLib.call("get", params2)
            .then(z=>{
            
                if (z.data.length>0) return response.failure({ status: false });
                else {

                    var passSalt = randomstring.generate({
                        length: 64,
                        charset: 'alphanumeric'
                    });

                    var passHash = CryptoJS.AES.encrypt(password, passSalt);

                    const params3 = {
                        TableName: 'users',
                        Item: {
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
                        params2.Item['vs'] = postbody.vs ? 1 : 0;
                        params2.Item['coach'] = postbody.coach ? 1 : 0;
                        params2.Item['casual'] = postbody.casual ? 1 : 0;
                    }

                    dynamoDbLib.call("put", params3)
                    .then(y=>{
                        return response.success(y);              
                    });
                }

            });
        }
    });
    } catch (e) {
      return response.failure({ status: false });
    }
  }
}