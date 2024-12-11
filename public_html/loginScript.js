
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();

    if (!username) {
        alert("Please enter a valid username.");
        return;
    }

    const welcomeMessage = document.getElementById("welcomeMessage");
    welcomeMessage.textContent = `Welcome, ${username}!`;

    // user data will go here
    const statsMessage = document.getElementById("statsMessage");
    statsMessage.textContent = "User data will display here: 1234";

    document.getElementById("loginForm").style.display = "none";
    document.getElementById("accountDetails").style.display = "block";
});

document.getElementById("logoutButton").addEventListener("click", function () {
    document.getElementById("username").value = "";
    document.getElementById("loginForm").style.display = "flex";
    document.getElementById("accountDetails").style.display = "none";
});
