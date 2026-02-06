// to do list
/*
- create handlers for input
- return the data from battle.action to client
- function to create new battle object and send it to client
- funciton to delete battle object on game end or when not used
*/

//Ideas
/*
- save battle objects in a database for long term storage
- allow users to make an account that saves win data
- create a game browser
- create an ai opponent
- customize game map size and fleet size
- more game modes
*/

// where i left off
/*
    
*/
import Battle from './battle.js';
import opponentAI from './opponentAI.js';

let battleList = {};
let aiList = {}

function createInstance(aiDificulty = 0){
    let gameid = Battle.generateGameId();
    battleList[gameid] = new Battle(gameid);

    switch(aiDificulty){
        case 1:
            aiList[gameid] = new opponentAI(gameid, 1);
            break;
        case 2:
            aiList[gameid] = new opponentAI(gameid, 2);
            break;
        case 3:
            aiList[gameid] = new opponentAI(gameid, 3);
            break;
        case 4:
            aiList[gameid] = new opponentAI(gameid, 4);
            break;
  }
}

function deleteInstance(gameid){
    if (battleList[gameid]){
        delete battleList[gameid];
    }
    if (aiList[gameid]){
        delete aiList[gameid];
    }
}

function inputHandler(detailsJson){  
// parses the input details from the client and sends it to the correct battle instance
    let details = JSON.parse(detailsJson);
    let gameid = details.gameId;
    let playerId = details.playerId;
    let actionDetails = details.actionDetails;
    let action = details.action;
    let returnData = {};
    let battleInstance = battleList[gameid];

    if (battleInstance){

        returnData = battleInstance.action(playerId, action, ...actionDetails);

        if (aiList[gameid])
            aiList[gameid].takeTurn(battleInstance);
    }   
    else returnData.error = "Invalid Game ID";

    return JSON.stringify(returnData);
}

export { createInstance, inputHandler, battleList };