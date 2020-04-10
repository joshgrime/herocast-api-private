const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);
    const params = {
      TableName: 'users',
      Key: {
        id: postbody.id
      },
      UpdateExpression: 'SET',
      ExpressionAttributeNames: {
      },
      ExpressionAttributeValues: {
      }
    };

    var isOkay = false;

    if (postbody.casual !== undefined) {
      params.ExpressionAttributeValues[':x'] = postbody.casual;
      params.ExpressionAttributeNames['#cadp'] = 'casual_default_price';
      params.UpdateExpression += ' #cadp = :x,';
      isOkay = true;
    }

    if (postbody.coach !== undefined) {
      params.ExpressionAttributeValues[':y'] = postbody.coach;
      params.ExpressionAttributeNames['#codp'] = 'coach_default_price';
      params.UpdateExpression += ' #codp = :y,';
      isOkay = true;
    }
    
    if (postbody.vs !== undefined) {
      params.ExpressionAttributeValues[':z'] = postbody.vs;
      params.ExpressionAttributeNames['#vsdp'] = 'vs_default_price';
      params.UpdateExpression += ' #vsdp = :z,';
      isOkay = true;
    }

    if (postbody.multi !== undefined) {
      params.ExpressionAttributeValues[':m'] = postbody.multi;
      params.ExpressionAttributeNames['#mudp'] = 'multi_default_price';
      params.UpdateExpression += ' #mudp = :m,';
      isOkay = true;
    }

    if (!isOkay) return response.failure({status:false, msg: 'No prices to update.'});

    params.UpdateExpression = params.UpdateExpression.substring(0,params.UpdateExpression.length-1);    
    
    try {
      await dynamoDbLib.call("update", params);
      return response.success(params.Item);
    } catch (e) {
      return response.failure({ status: false });
    }
  }
}