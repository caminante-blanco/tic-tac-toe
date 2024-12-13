document.addEventListener("DOMContentLoaded", async() => {
    const Place1 = document.getElementById("Place1");
    const Place2 = document.getElementById("Place2");
    const Place3 = document.getElementById("Place3");
    const Place4 = document.getElementById("Place4");
    const Place5 = document.getElementById("Place5");
    const Place6 = document.getElementById("Place6");
    const Place7 = document.getElementById("Place7");
    const Place8 = document.getElementById("Place8");
    const Place9 = document.getElementById("Place9");
    const Place10 = document.getElementById("Place10");

    const playerList = await getPlayerList();
    
    const leaderboard = [Place1, Place2, Place3, Place4, Place5, Place6, Place7, Place8, Place9, Place10];

    for (let i = 0; i < leaderboard.length; i++) {
        if (playerList[i]) {
            leaderboard[i].innerText = `${i + 1}. ${playerList[i].username} - Wins: ${playerList[i].wins}`;
         } else {
            leaderboard[i].innerText = `${i + 1}. No player`;
        }
    }
    
    async function getPlayerList(){
        try {
            const response = await fetch(`/getAllUserInfo`,{ method: "GET",});
            const playerlist = await response.json();
            return playerlist;
        } catch (error) {
            console.error("Leaderboard error:", error);
            alert("An error occured while generating leaderboard");
        }
    }

});