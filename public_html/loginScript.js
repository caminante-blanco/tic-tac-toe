document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const accountDetails = document.getElementById("accountDetails");
    const helpButton = document.getElementById("helpButton");
    const usernameInput = document.getElementById("username");

    if (loginForm != null) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const username = usernameInput.value.trim();

            if (!username) {
                alert("Please enter a valid username.");
                return;
            }
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
    }

    helpButton.addEventListener("click", () => {
        window.location.href = "/help";
    });
});
