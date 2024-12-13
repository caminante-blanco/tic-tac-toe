const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { engine } = require("express-handlebars");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 80;

app.engine(
    "handlebars",
    engine({
        helpers: {
            json: function(object) {
                return JSON.stringify(object);
            },
        },
        defaultLayout: false,
    }),
);
app.set("view engine", "handlebars");
app.set("views", "./views");

io.on("connection", (socket) => {
    socket.on("joinGame", (gameUUID) => {
        socket.join(gameUUID);
    });
});

mongoose.connect("mongodb://localhost:27017/tic-tac-toe");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    uuid: { type: String, required: true, unique: true },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    cats: { type: Number, default: 0 },
});

const gameSchema = new mongoose.Schema({
    uuid: { type: String, required: true, unique: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    board: { type: [String], default: ["", "", "", "", "", "", "", "", ""] },
    turn: { type: Number, default: 0 },
    winner: { type: String, default: null },
    ai: { type: Boolean, default: false },
    gameOver: { type: Boolean, default: false },
});

const allTimeStatsSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        totalWins: { type: Number, default: 0 },
        totalLosses: { type: Number, default: 0 },
        totalCats: { type: Number, default: 0 },
    },
    { timestamps: true },
);

const User = mongoose.model("User", userSchema);
const Game = mongoose.model("Game", gameSchema);
const AllTimeStats = mongoose.model("AllTimeStats", allTimeStatsSchema);

app.use(express.json());
app.use(express.static("public_html"));

app.post("/login/:username", async (req, res) => {
    try {
        const { username } = req.params;
        let user = await User.findOne({ username });
        if (!user) {
            user = new User({ username, uuid: uuidv4() });
            await user.save();
        }
        res.redirect(`/user/${user.uuid}`);
    } catch (error) {
        res.status(500).json({ error: "Failed to login" });
    }
});

app.get("/user/:playerUUID", async (req, res) => {
    try {
        const user = await User.findOne({ uuid: req.params.playerUUID });
        if (!user) return res.status(404).send("User not found");
        const jsonUser = user.toJSON();
        res.render("userPage", { user: jsonUser });
    } catch (error) {
        res.status(500).send("An error occurred");
    }
});

app.get("/newgame", async (req, res) => {
    try {
        const isAIGame = req.query.ai === "true";
        const playerUUID = req.query.player;
        const user = await User.findOne({ uuid: playerUUID });
        if (!user) return res.status(404).json({ error: "User not found" });
        const newGame = new Game({
            uuid: uuidv4(),
            ai: isAIGame,
            players: [user._id],
        });
        await newGame.save();
        res.redirect(`/game/${playerUUID}/${newGame.uuid}`);
    } catch (error) {
        res.status(500).json({ error: "Failed to create new game" });
    }
});

app.get("/game/:playerUUID/:gameUUID", async (req, res) => {
    try {
        const game = await Game.findOne({ uuid: req.params.gameUUID }).populate(
            "players",
        );
        if (!game) return res.status(404).send("Game not found");
        const user = await User.findOne({ uuid: req.params.playerUUID });
        if (!user) return res.status(404).send("User not found");
        const jsonUser = user.toJSON();
        const jsonGame = game.toJSON();
        res.render("gamePage", { game: jsonGame, user: jsonUser });
    } catch (error) {
        res.status(500).json({ error: "Failed to get game" });
    }
});

app.get("/joinGame/:gameUUID", async (req, res) => {
    try {
        const { gameUUID } = req.params;
        const { playerUUID } = req.query;
        const game = await Game.findOne({ uuid: gameUUID });
        if (!game) return res.status(404).json({ error: "Game not found" });
        const user = await User.findOne({ uuid: playerUUID });
        if (!user) return res.status(404).json({ error: "User not found" });
        game.players.push(user._id);
        await game.save();
        res.redirect(`/game/${playerUUID}/${gameUUID}`);
    } catch (error) {
        res.status(500).json({ error: "Failed to join game" });
    }
});

app.get("/joinGame/:gameUUID", async (req, res) => {
    try {
        const { gameUUID } = req.params;
        const { playerUUID } = req.query;
    
        const game = await Game.findOne({ uuid: gameUUID });
        if (!game) {
        return res.status(404).json({ error: "Game not found" });
        }
    
        const user = await User.findOne({ uuid: playerUUID });
        if (!user) {
        return res.status(404).json({ error: "User not found" });
        }
    
        game.players.push(user._id);
        await game.save();
    
        res.redirect(`/game/${playerUUID}/${gameUUID}`);
    } catch (error) {
        console.error("Error joining game:", error);
        res.status(500).json({ error: "Failed to join game" });
    }
    });

app.get("/makeMove/:index/:gameUUID", async (req, res) => {
    try {
        const { index, gameUUID } = req.params;
        const { playerUUID } = req.query;
        const game = await Game.findOne({ uuid: gameUUID }).populate("players");
        if (!game) return res.status(404).json({ error: "Game not found" });
        if (game.gameOver)
            return res.status(400).json({ error: "Game is already over." });
        const currentPlayerMark = game.turn % 2 === 0 ? "X" : "O";
        const currentPlayerIndex = game.turn % 2;
        const user = await User.findOne({ uuid: playerUUID });
        if (!user) return res.status(404).json({ error: "User not found." });

        const playerIsInGame = game.players.some((id) => id.equals(user._id));
        const playerIsInFirstTwo = game.players
            .slice(0, 2)
            .some((id) => id.equals(user._id));

        if (game.players.length > 2 && !playerIsInFirstTwo)
            return res
                .status(403)
                .json({ error: "You are not a player in this game." });
        if (game.players.length <= 2 && !playerIsInGame)
            return res
                .status(403)
                .json({ error: "You are not a player in this game." });

        if (!game.players[currentPlayerIndex].equals(user._id))
            return res.status(403).json({ error: "It's not your turn." });

        if (game.board[index] !== "")
            return res.status(400).json({ error: "Space already taken." });

        game.board[index] = currentPlayerMark;
        game.turn++;
        const winnerMark = checkWinner(game.board);
        const isBoardFull = game.board.every((c) => c !== "");

        if (winnerMark) {
            game.gameOver = true;
            const winnerUser = winnerMark === "X" ? game.players[0] : game.players[1];
            const winnerDoc = await User.findById(winnerUser);
            game.winner = winnerDoc ? winnerDoc.username : null;
        } else if (isBoardFull) {
            game.gameOver = true;
            game.winner = null;
        }

        await game.save();

        if (game.gameOver && game.players.length >= 2) {
            const playerX = await User.findById(game.players[0]);
            const playerO = await User.findById(game.players[1]);
            if (playerX && playerO) {
                if (game.winner === playerX.username) {
                    playerX.wins++;
                    playerO.losses++;
                    await playerX.save();
                    await playerO.save();

                    let xStats = await AllTimeStats.findOne({ user: playerX._id });
                    if (!xStats) xStats = new AllTimeStats({ user: playerX._id });
                    xStats.totalWins++;
                    await xStats.save();

                    let oStats = await AllTimeStats.findOne({ user: playerO._id });
                    if (!oStats) oStats = new AllTimeStats({ user: playerO._id });
                    oStats.totalLosses++;
                    await oStats.save();
                } else if (game.winner === playerO.username) {
                    playerO.wins++;
                    playerX.losses++;
                    await playerO.save();
                    await playerX.save();

                    let oStats = await AllTimeStats.findOne({ user: playerO._id });
                    if (!oStats) oStats = new AllTimeStats({ user: playerO._id });
                    oStats.totalWins++;
                    await oStats.save();

                    let xStats = await AllTimeStats.findOne({ user: playerX._id });
                    if (!xStats) xStats = new AllTimeStats({ user: playerX._id });
                    xStats.totalLosses++;
                    await xStats.save();
                } else {
                    playerX.cats++;
                    playerO.cats++;
                    await playerX.save();
                    await playerO.save();

                    let xStats = await AllTimeStats.findOne({ user: playerX._id });
                    if (!xStats) xStats = new AllTimeStats({ user: playerX._id });
                    xStats.totalCats++;
                    await xStats.save();

                    let oStats = await AllTimeStats.findOne({ user: playerO._id });
                    if (!oStats) oStats = new AllTimeStats({ user: playerO._id });
                    oStats.totalCats++;
                    await oStats.save();
                }
            }
        }

        res.json({
            message: "Move made successfully",
            winner: game.winner,
            gameOver: game.gameOver,
        });
        io.to(gameUUID).emit("gameStateChanged", { gameUUID, changed: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to make move" });
    }
});

app.get("/getAllUserInfo", async(req,res) => {
  try {
  const playerInfo = await User.find().sort({wins: -1}).lean();
  res.json(playerInfo);
  } catch (error) {
    console.error("Error fetching user information:", error);
    res.status(500).json({error: "failed to get info"});
  }
})

app.get("/help", (req, res) => {
    res.render("helpPage");
});

function checkWinner(board) {
        const combos = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (const [a, b, c] of combos) {
            if (board[a] && board[a] === board[b] && board[b] === board[c])
                return board[a];
        }
        return null;
    }

server.listen(port, () => console.log(`Server listening on port ${port}`));
