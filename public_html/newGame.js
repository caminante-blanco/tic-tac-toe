document.addEventListener("DOMContentLoaded", () => {
    const newGameButton = document.getElementById("newGameButton");
    const gameJoinCode = document.getElementById("gameJoinCode");
    const joinGameButton = document.getElementById("joinGameButton");
  
    if (newGameButton) {
      newGameButton.addEventListener("click", async () => {
        const aiGameCheckbox = document.getElementById("aiGame");
        const isAIGame = aiGameCheckbox.checked;
        const playerUUIDInput = document.getElementById("playerUUID");
        const playerUUID = playerUUIDInput.value;
  
        try {
          const response = await fetch(`/newgame?ai=${isAIGame}&player=${playerUUID}`, {
            method: "GET",
          });
          if (response.redirected) {
            window.location.href = response.url;
          }
        } catch (error) {
          console.error("Error starting new game:", error);
          alert("An error occurred while starting a new game.");
        }
      });
    }
  
    if (joinGameButton) {
      joinGameButton.addEventListener("click", async () => {
        const playerUUIDInput = document.getElementById("playerUUID");
        const playerUUID = playerUUIDInput.value;
        const gameUUID = gameJoinCode.value.trim();
  
        if (!gameUUID) {
          alert("Please enter a game code.");
          return;
        }
  
        try {
          const response = await fetch(`/joinGame/${gameUUID}?playerUUID=${playerUUID}`, {
            method: "GET",
          });
  
          if (response.redirected) {
            window.location.href = response.url;
          } else {
            const data = await response.json();
            if (data.redirect) {
              window.location.href = data.redirect;
            } else if (data.error) {
              alert(data.error);
            }
          }
        } catch (error) {
          console.error("Error joining game:", error);
          alert("An error occurred while joining the game.");
        }
      });
    }
  });
  
  