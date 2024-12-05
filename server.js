const mongoose = require('mongoose');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const mongoURL = "mongodb://127.0.0.1/players";

const app = express();

// connects to the database
mongoose.connect(mongoURL);
console.log("Connected to MongoDB");

// This is the schema that will serve as the basis for the players profile
const playerSchema = new mongoose.Schema({
    username: String, 
    uuid: String,
    totalGamesPlayed: Number,
    wins: Number,
    losses: Number,
    winrate:{
        type: Number,
        max: 100,
    },
    elo: Number,
    rank:{
        type: String,
        enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]
    },
});

// makes the model for the Schema
const Player = mongoose.model("Player", playerSchema);

// this function will be used to create a new User based on a username, If it detects that the username already exists in the database, 
// then it will not create a newPlayer
async function createPlayer(Username) {
    let user = await Player.findOne({username: Username})
    if (!user)  {
    newAccount = new Player({
        username: Username,
        uuid: uuidv4(),
        totalGamesPlayed: 0,
        wins: 0,
        losses: 0,
        winrate: 0,
        losses: 0,
        elo: 0,
        rank: "Bronze",
    });
    await newAccount.save();
    console.log("Player created:", newAccount);
    }
}

createPlayer("NewPlayer");


