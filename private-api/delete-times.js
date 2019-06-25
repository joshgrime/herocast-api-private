const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

    if (postbody.times.length > 25) return response.failure({status:false,errorMessage:'You may only delete 25 times at once.'});

    const params = {
      "TableName": "gameslots",
      "IndexName": "hostid-date-index",
      "KeyConditionExpression": "#hostid = :h and #date = :d",
      ExpressionAttributeNames: {
        "#hostid":"hostid",
        "#date": "date"
      },
      ExpressionAttributeValues: {
          ":h": postbody.hostid,
          ":d": postbody.date
      }
    };

    try {
      var times = await dynamoDbLib.call("query", params);
      console.log(times);
      
      const deleteParams = {
        RequestItems: {
            "gameslots": []
        }
      }

      for (let x of postbody.times) {
        for (let y of times.Items) {
          if (x == y.time)  {
            let obj = {
              DeleteRequest: {
                Key: {
                  "id": y.id,
                  "hostid": postbody.hostid,
                }
              }
            };
            deleteParams.RequestItems.gameslots.push(obj);
          }
        }
      }
      
      console.log(JSON.stringify(deleteParams));
 
      var dels = await dynamoDbLib.call("batchWrite", deleteParams)

      if (dels.UnprocessedItems.length > 0) {
        return response.failure({status:false, errorMessage:'Not all items were deleted.'})
      }
      else {
        return response.success({status:true});
      }
    } catch (e) {
      console.log('Big error!');
      console.log(e);
      return response.failure({ status: false });
    }
  }
}