document.addEventListener("DOMContentLoaded", () => {
  const gridItems = document.querySelectorAll(".grid-item");
  const message = document.getElementById("message");
  const gameDataElement = document.getElementById("gameData");

  if (gameDataElement) {
    try {
      const game = JSON.parse(gameDataElement.textContent);
      const playerUUID = document.getElementById("playerUUID").value;

      gridItems.forEach((item) => {
        item.addEventListener("click", () => {
          const index = item.dataset.index;
          fetch(`/makeMove/${index}/${game.uuid}?playerUUID=${playerUUID}`, {
            method: "GET",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              // No need to parse JSON, just check if the response is OK
              window.location.reload();
            })
            .catch((error) => {
              console.error("Error:", error);
              message.textContent = "An error occurred.";
            });
        });
      });
    } catch (error) {
      console.error("Error parsing game data:", error);
      message.textContent = "Error loading game data.";
    }
  }
});
