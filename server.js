const mongoose = require('mongoose');
const URL = "mongodb://127.0.0.1/players";

// connects to the database
async function main() {
    await mongoose.connect(URL);
    console.log("Connected to MongoDB");
}

// This is the schema that will serve as the basis for the players profile
const playerSchema = new mongoose.Schema({
    username:{
       type: String,
       unique: true,
    } ,
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

const Player = mongoose.model("Player", playerSchema);

// this function will be used in the html to create a new user and save them to the DB
async function createPlayer(newUsername) {
    let newAccount = new Player({
        username: newUsername,
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

main().then(async ()=> {
    createPlayer("NewPlayer");
});

