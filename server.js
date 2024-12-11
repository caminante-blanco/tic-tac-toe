const express = require('express');
const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');

const app = express();
const port = 3000;

const mongoURI = 'mongodb://localhost:27017/tic-tac-toe';

mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    uuid: {type: String, required: true, unique: true},
    wins: {type: Number, default: 0},
    losses: {type: Number, default: 0},
    cats: {type: Number, default: 0},
});

const gameSchema = new mongoose.Schema({
    uuid: {type: String, required: true, unique: true},
    players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    board: {type: [String], default: ["", "", "", "", "", "", "", "", ""]},
    turn: {type: Number, default: 0},
    winner: {type: String, default: null},
    ai: {type: Boolean, default: false},
    gameOver: {type: Boolean, default: false},
});

const User = mongoose.model('User', userSchema);
const Game = mongoose.model('Game', gameSchema);

app.use(express.json());

app.post('login/:username', async (req, res) => {
    const {username} = req.params;
    let user = await User.findOne({username});

    if (!user) {
        user = new User({
            username,
            uuid: uuidv4(),
        });
        await user.save();
    }

    res.redirect(`/${user.uuid}`);
});

app.get('/:playerUUID', async (req, res) => {
    try {
    const user = await User.findOne({uuid: req.params.playerUUID});
    if (!user) {
        return res.status(404).send('User not found');
        }
    res.status(200).json(user);
    }
    catch (error) {
        res.status(500).send('An error occurred');
    }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));


