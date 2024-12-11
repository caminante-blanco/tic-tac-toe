document.addEventListener("DOMContentLoaded", () => {
  const newGameButton = document.getElementById("newGameButton");

  if (newGameButton) {
    newGameButton.addEventListener("click", async () => {
      const aiGameCheckbox = document.getElementById("aiGame");
      const isAIGame = aiGameCheckbox.checked;
      const playerUUIDInput = document.getElementById("playerUUID");
      const playerUUID = playerUUIDInput.value;

      try {
        const response = await fetch(
          `/newgame?ai=${isAIGame}&player=${playerUUID}`,
          { method: "GET" },
        );
        if (response.redirected) {
          window.location.href = response.url;
        } 
      } catch (error) {
        console.error("Error starting new game:", error);
        alert("An error occurred while starting a new game.");
      }
    });
  }
});
