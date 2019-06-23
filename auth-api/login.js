const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");
const CryptoJS = require("crypto-js");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(JSON.stringify(event.body));
    const params = {
      TableName: 'users',
      Key: {
        email: postbody.email
      }
    };
    try {
      dynamoDbLib.call("get", params)
      .then(x=>{
        //check the email matches
        if (x.email !== postbody.email) return response.failure({ status: false });
        else {

            const params2 = {
                TableName: 'salts',
                Key: {
                    id: x.id
                }
            }

            dynamoDbLib.call("get", params2)
            .then(y=>{
                //decrypt password
                var bytes  = CryptoJS.AES.decrypt(x.password, y.salt);
                var unhashedpass = bytes.toString(CryptoJS.enc.Utf8);
                //check the password matches
                if (unhashedpass !== postbody.password) return response.failure({ status: false });
                else return response.success(x.id, x.username, x.host);                
            });

        }
       return response.success(x);

      });
    } catch (e) {
      return response.failure({ status: false });
    }
  }
}