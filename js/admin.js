/****************************************************
 ADMIN.JS
 NOC Application Tracking System
 ADMIN Panel – Secure & Stable
*****************************************************/

const API_URL = "https://script.google.com/macros/s/AKfycbzRtiKqsw0pMI-cLzoj8G-PgLxP0wk_sAsWvNiFrmS2_xEJCkr9qw_YtrGj_1UQtroi/exec";   // 🔴 Replace with your Apps Script Web App URL

const role = localStorage.getItem("role");
const username = localStorage.getItem("username");  // Must be stored during login

/****************************************************
 ACCESS CONTROL
*****************************************************/
if (role !== "ADMIN") {
  alert("Access Denied");
  window.location.href = "dashboard.html";
}

/****************************************************
 CREATE USER (ADMIN ONLY)
*****************************************************/
async function createUser() {

  const newUsername = document.getElementById("newUsername").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const roleValue = document.getElementById("newRole").value;
  const circle = document.getElementById("newCircle").value;

  if (!newUsername || !newPassword) {
    alert("Username and Password are required.");
    return;
  }

  try {

    const passwordHash = await sha256(newPassword);

    const response = await fetch(API_URL + "?action=createUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: newUsername,
        passwordHash: passwordHash,
        role: roleValue,
        circle: circle,
        requesterRole: role
      })
    });

    const result = await response.json();

    if (result.success) {
      alert("User Created Successfully");
      document.getElementById("newUsername").value = "";
      document.getElementById("newPassword").value = "";
      loadUsers();
    } else {
      alert("Operation Failed: " + (result.message || ""));
    }

  } catch (error) {
    alert("Server Error. Please try again.");
  }
}

/****************************************************
 LOAD USERS (ADMIN ONLY)
*****************************************************/
async function loadUsers() {

  try {

    const response = await fetch(
      API_URL + "?action=getUsers&role=" + encodeURIComponent(role)
    );

    const users = await response.json();

    const tbody = document.querySelector("#userTable tbody");
    tbody.innerHTML = "";

    users.forEach(user => {

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${user.Username}</td>
        <td>${user.Role}</td>
        <td>${user.Assigned_Circle || ""}</td>
        <td>${user.Status}</td>
        <td>
          <button onclick="toggleUser('${user.Username}')">
            Activate / Deactivate
          </button>
        </td>
      `;

      tbody.appendChild(row);
    });

  } catch (error) {
    alert("Unable to load users.");
  }
}

/****************************************************
 TOGGLE USER STATUS (ADMIN ONLY)
*****************************************************/
async function toggleUser(targetUsername) {

  if (targetUsername === username) {
    alert("You cannot deactivate your own account.");
    return;
  }

  try {

    const response = await fetch(API_URL + "?action=toggleUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: targetUsername,
        requesterRole: role
      })
    });

    const result = await response.json();

    if (result.success) {
      loadUsers();
    } else {
      alert("Operation Failed.");
    }

  } catch (error) {
    alert("Server Error.");
  }
}

/****************************************************
 LOGOUT
*****************************************************/
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

/****************************************************
 SHA-256 PASSWORD HASH
*****************************************************/
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/****************************************************
 INITIAL LOAD
*****************************************************/

loadUsers();
