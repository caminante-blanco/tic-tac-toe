document.addEventListener("DOMContentLoaded", () => {
    const gridItems = document.querySelectorAll(".grid-item");
    const message = document.getElementById("message");
    const gameDataElement = document.getElementById("gameData");
    const playerUUIDElement = document.getElementById("playerUUID");

    if (!gameDataElement || !playerUUIDElement) {
        if (message) message.textContent = "Error: Missing game data.";
        return;
    }

    try {
        const game = JSON.parse(gameDataElement.textContent);
        const gameUUID = game.uuid;
        const playerUUID = playerUUIDElement.value;

        if (!gameUUID || !playerUUID)
            throw new Error("Missing gameUUID or playerUUID.");

        let playerIndex = -1;
        if (game.players && game.players.length > 0) {
            playerIndex = game.players.findIndex((p) => p.uuid === playerUUID);
        }

        const isGameOver = game.gameOver;
        const currentTurnIndex = game.turn % 2;

        if (!isGameOver) {
            if (playerIndex === 0) {
                message.textContent =
                    currentTurnIndex === 0
                        ? "It's your turn!"
                        : "Waiting for your opponent...";
            } else if (playerIndex === 1) {
                message.textContent =
                    currentTurnIndex === 1
                        ? "It's your turn!"
                        : "Waiting for your opponent...";
            } else {
                message.textContent = "You are a spectator.";
            }
        } else {
            if (game.winner) {
                message.textContent = `Game Over! Player ${game.winner} has won!`;
            } else {
                message.textContent = "Game Over! It's a tie!";
            }
        }

        const socket = io();
        socket.emit("joinGame", gameUUID);

        gridItems.forEach((item) => {
            item.addEventListener("click", () => {
                const index = item.dataset.index;
                fetch(`/makeMove/${index}/${gameUUID}?playerUUID=${playerUUID}`, {
                    method: "GET",
                })
                    .then(async (response) => {
                        if (!response.ok) {
                            let errorMsg = `HTTP error! status: ${response.status}`;
                            try {
                                const data = await response.json();
                                if (data.error) errorMsg = data.error;
                            } catch (err) { }
                            throw new Error(errorMsg);
                        }
                        return response.json();
                    })
                    .then(() => {
                        window.location.reload();
                    })
                    .catch((error) => {
                        if (message)
                            message.textContent =
                                error.message || "An error occurred while making the move.";
                    });
            });
        });

        socket.on("gameStateChanged", ({ gameUUID, changed, error }) => {
            if (changed) {
                window.location.reload();
            } else if (error && message) {
                message.textContent = error;
            }
        });
    } catch (error) {
        if (message) message.textContent = "Error loading game data.";
    }
});
