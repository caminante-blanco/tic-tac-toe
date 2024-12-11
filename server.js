const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { engine } = require("express-handlebars");

const app = express();
const port = 3000;
app.use(express.json());
app.use(express.static("public_html"));
app.engine("handlebars", engine({ defaultLayout: false }));
app.set("view engine", "handlebars");
app.set("views", "./views");

const mongoURI = "mongodb://localhost:27017/tic-tac-toe";

mongoose.connect(mongoURI);

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
    const game = await Game.findOne({ uuid: req.params.gameUUID }).populate(
      "players",
    );
    if (!game) {
      return res.status(404).send("Game not found");
    }
    res.send(`This is the game page, ${game.players[0].username}`);
  } catch (error) {
    console.error("Error getting game:", error);
    res.status(500).json({ error: "Failed to get game" });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
