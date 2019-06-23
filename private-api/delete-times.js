const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(JSON.stringify(event.body));
    const params = {
      TableName: 'users',
      Key: {
        id: postbody.id
      }
    };
    try {
      dynamoDbLib.call("get", params)
      .then(x=>{

        console.log(x);
        if (x.host !== 1) return response.failure({ status: false, body: 'Not a host account' });
        if (x.twitchauthenticated !== 1) return response.failure({ status: false, body: 'Not authenticated with Twitch' });
        if (x.games === null) return response.failure({ status: false, body: 'You do not have any games selected' });
        if (x.console === null) return response.failure({ status: false, body: 'You have not selected a console' });

        for (let x=0; x<postbody.times.length;x++) {
            var insert = true;
           
        }

       return response.success(x);

      });
    } catch (e) {
      return response.failure({ status: false });
    }
  }
}