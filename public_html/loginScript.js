document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const accountDetails = document.getElementById("accountDetails");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const statsMessage = document.getElementById("statsMessage");
  const logoutButton = document.getElementById("logoutButton");
  const usernameInput = document.getElementById("username");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
      alert("Please enter a valid username.");
      return;
    }

    welcomeMessage.textContent = `Welcome, ${username}!`;
    statsMessage.textContent = "User data will display here: 1234";

    loginForm.style.display = "none";
    accountDetails.style.display = "block";

    try {
      const response = await fetch(`/login/${username}`, {
        method: "POST",
      });
      if (response.redirected) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login.");
    }
  });

  logoutButton.addEventListener("click", () => {
    usernameInput.value = "";
    loginForm.style.display = "flex";
    accountDetails.style.display = "none";
  });
});


