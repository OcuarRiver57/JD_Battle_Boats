// to do list
/*
- create dict for each battle (key: battle.id, value: battle object)
- create handlers for http requests for battles
- use battle id in http request to find battle object
- use battle.action to pass in data from http request
- return the data from battle.action to client
- function to create new battle object and send it to client
- funciton to delete battle object on game end or when not used
- learn more about async functions and use them to avoid blocking the main thread
*/

//Ideas
/*
- save battle objects in a database for long term storage
- allow users to make an account that saves win data
- save win data to database
- leaderbord?
- create a game browser
- allow spectators?
- create an ai opponent
- 4 player coop / ai co control?
- customize game map size and fleet size
- more game modes
- local play?
*/

// where i left off
/*
    
*/
import "battle.js";

let instances = {};

function createInstance(){
  instances[instances.length] = 
}


require("dotenv").config();
const port = process.env.PORT || 3000;
const url = process.env.URL || "http://localhost:3000";

const express = require("express");
const app = express();

app.use(express.static("client/dist"));

app.listen(port, () => {
  console.log(`Server running on ${url}`);
});
