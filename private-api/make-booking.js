const dynamoDbLib = require("../libs/dynamodb-lib");
const response = require("../libs/response-lib");

module.exports = {
  main: async function (event, context) {
    var postbody = JSON.parse(event.body);

    if (postbody.hostid == postbody.userid) return response.failure({status: false, errorMessage: 'You cannot book a game with yourself.'});
    if (postbody.ingamename === undefined || postbody.ingamename === null) return response.failure({status: false, errorMessage: 'No player ingame name attached'});
    if (postbody.type === undefined || postbody.type === null) return response.failure({status: false, errorMessage: 'No game type found'});
    if (postbody.game === undefined || postbody.game === null) return response.failure({status: false, errorMessage: 'No game found'});


    var gameprice;
    if (postbody.type === 'coach') gameprice = 'coachprice';
    else if (postbody.type === 'vs') gameprice  = 'vsprice';
    else if (postbody.type === 'casual') gameprice = 'casualprice';
    else return response.failure({status: false, errorMessage: 'No valid game type specified'});

    const params = {
        "TableName": "gameslots",
        "Key": {
            "id":postbody.slotid,
            "hostid":postbody.hostid
        },
        "ProjectionExpression": "id, booked, console, #gameprice",
        "ExpressionAttributeNames": {
          "#gameprice": gameprice
        }
    }

    try {
      var gameslotDetails = await dynamoDbLib.call("get", params);

      if (gameslotDetails.Item.booked !==0) return response.failure({status: false, errorMessage: 'Game is already fully booked.'});
      
      var playerCoinsParams = {
        "TableName": "users",
        "Key": {
            "id":postbody.userid
        },
        "ProjectionExpression": "coins",
      }

      var playerCoins = await dynamoDbLib.call("get", playerCoinsParams);

      if (playerCoins.Item.coins < gameslotDetails.Item[gameprice]) return response.failure({status: false, errorMessage: 'You do not have enough coins!'});
      else {

        var newWealth = playerCoins.Item.coins - gameslotDetails.Item[gameprice];


        const gameDetailsParams = {
          "TableName": 'games',
          "Key": {
            "id":postbody.game
          },
          "ProjectionExpression": "#n",
          "ExpressionAttributeNames": {
            '#n' : 'name'
          }
        }
        var gameDetails = await dynamoDbLib.call("get", gameDetailsParams);
        var gameName = gameDetails.Item.name;

        const updateGameSlotParams = {
            "TableName": 'gameslots',
            "Key": {
              "id": postbody.slotid,
              "hostid": postbody.hostid
            },
            "UpdateExpression": 'SET #b = :true, #p = :id, #g = :game, #gn = :gameName, #s = :status, #t = :type, #pign = :playerign',
            "ExpressionAttributeNames": {
              '#b' : 'booked',
              '#p' : 'playerid',
              '#g' : 'game',
              '#gn': 'gameName',
              '#s' : 'status',
              "#t" : 'type',
              '#pign':'playeringamename'
            },
            "ExpressionAttributeValues": {
                ':true' : 1,
                ':id' : postbody.userid,
                ':game' : postbody.game,
                ':gameName' : gameName,
                ':status' : 'booked',
                ':playerign': postbody.ingamename,
                ':type': postbody.type
            }
          };

          var successFullyBookedGame = await dynamoDbLib.call('update', updateGameSlotParams);

          var newWealthParams = {
            TableName: 'users',
            Key: {
              id: postbody.userid
            },
            UpdateExpression: 'SET #c = :nw',
            ExpressionAttributeNames: {
              '#c' : 'coins'
            },
            ExpressionAttributeValues: {
                ':nw': newWealth
            }
          }; 
          
          var coins = await dynamoDbLib.call('update', newWealthParams);
          return response.success({status: true});
      }
    } catch (e) {
      return response.failure({ status: false, errorMessage: e });
    }
  }
}