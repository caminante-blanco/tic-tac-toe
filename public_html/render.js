document.addEventListener("DOMContentLoaded", () => {
    const gridItems = document.querySelectorAll(".grid-item");
    const message = document.getElementById("message");
    const gameDataElement = document.getElementById("gameData");
    const playerUUIDElement = document.getElementById("playerUUID");

    // Ensure elements exist
    if (!gameDataElement || !playerUUIDElement) {
        console.error("Missing gameData or playerUUID element.");
        if (message) {
            message.textContent = "Error: Missing game data.";
        }
        return;
    }

    try {
        const game = JSON.parse(gameDataElement.textContent);
        const gameUUID = game.uuid;
        const playerUUID = playerUUIDElement.value;

        if (!gameUUID || !playerUUID) {
            throw new Error("Missing gameUUID or playerUUID.");
        }

        const socket = io(); 
        socket.emit("joinGame", gameUUID);

        gridItems.forEach((item) => {
            item.addEventListener("click", () => {
                const index = item.dataset.index;

                fetch(`/makeMove/${index}/${gameUUID}?playerUUID=${playerUUID}`, {
                    method: "GET",
                })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    // If move is successful, reload the page to reflect changes
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Error:", error);
                    if (message) {
                        message.textContent = "An error occurred while making the move.";
                    }
                });
            });
        });

        socket.on('gameStateChanged', ({ gameUUID, changed, error }) => {
            if (changed) {
                // Game state has changed, reload the page
                window.location.reload(); 
            } else {
                // Handle errors
                if (error && message) {
                    message.textContent = error; 
                }
            }
        });
    } catch (error) {
        console.error("Error parsing game data:", error);
        if (message) {
            message.textContent = "Error loading game data.";
        }
    }
});

