/****************************************************
 AUTH.JS
 NOC Application Tracking System
 Secure Login Module
*****************************************************/

const API_URL = "https://script.google.com/macros/s/AKfycbzRtiKqsw0pMI-cLzoj8G-PgLxP0wk_sAsWvNiFrmS2_xEJCkr9qw_YtrGj_1UQtroi/exec";

/****************************************************
 LOGIN FUNCTION
*****************************************************/
async function login() {

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorBox = document.getElementById("error");

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  errorBox.innerText = "";

  if (!username || !password) {
    errorBox.innerText = "Username and Password are required.";
    return;
  }

  try {

    const passwordHash = await sha256(password);

    const response = await fetch(API_URL + "?action=login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        passwordHash: passwordHash
      })
    });

    const result = await response.json();

    if (result.success) {

      // Store session details
      localStorage.setItem("role", result.role);
      localStorage.setItem("circle", result.circle || "");
      localStorage.setItem("username", username);

      // Redirect based on role
      if (result.role === "ADMIN") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }

    } else {
      errorBox.innerText = "Invalid Username or Password.";
    }

  } catch (error) {
    errorBox.innerText = "Server not reachable. Try again.";
  }
}

/****************************************************
 SHA-256 PASSWORD HASHING
*****************************************************/
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}