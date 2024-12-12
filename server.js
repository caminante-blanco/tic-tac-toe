const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { engine } = require("express-handlebars");

const app = express();
const server = http.createServer(app);
const io = new Server(server);  

const port = 3000;

app.engine("handlebars", engine({
  helpers: {
    json: function (object) {
      return JSON.stringify(object);
    },
  },
  defaultLayout: false,
}));
app.set("view engine", "handlebars");
app.set("views", "./views");

// Socket.io connection handler
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

const User = mongoose.model("User", userSchema);
const Game = mongoose.model("Game", gameSchema);

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
    console.error("Error during login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

app.get("/user/:playerUUID", async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.params.playerUUID });
    if (!user) {
      return res.status(404).send("User not found");
    }
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
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newGame = new Game({
      uuid: uuidv4(),
      ai: isAIGame,
      players: [user._id],
    });
    await newGame.save();

    res.redirect(`/game/${playerUUID}/${newGame.uuid}`);
  } catch (error) {
    console.error("Error creating new game:", error);
    res.status(500).json({ error: "Failed to create new game" });
  }
});

app.get("/game/:playerUUID/:gameUUID", async (req, res) => {
  try {
    const game = await Game.findOne({ uuid: req.params.gameUUID }).populate("players");
    if (!game) {
      return res.status(404).send("Game not found");
    }
    const user = await User.findOne({ uuid: req.params.playerUUID });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const jsonUser = user.toJSON();
    const jsonGame = game.toJSON();
    res.render("gamePage", { game: jsonGame, user: jsonUser });
  } catch (error) {
    console.error("Error getting game:", error);
    res.status(500).json({ error: "Failed to get game" });
  }
});

app.get("/makeMove/:index/:gameUUID", async (req, res) => {
  try {
    const { index, gameUUID } = req.params;
    const { playerUUID } = req.query;

    const game = await Game.findOne({ uuid: gameUUID });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Check if space is already taken
    if (game.board[index] !== "") {
      return res.status(400).json({ error: "Space already taken" });
    }

    // Determine the current player (X or O)
    const currentPlayer = game.turn % 2 === 0 ? "X" : "O";
    game.board[index] = currentPlayer;
    game.turn++;

    await game.save();
    res.json({ message: "Move made successfully" });

    // Notify all connected clients in this game's room that the state changed
    io.to(gameUUID).emit("gameStateChanged", { gameUUID, changed: true });
  } catch (error) {
    console.error("Error making move:", error);
    res.status(500).json({ error: "Failed to make move" });
  }
});

server.listen(port, () => console.log(`Server listening on port ${port}`));

