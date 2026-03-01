const API_URL = "https://script.google.com/macros/s/AKfycbzRtiKqsw0pMI-cLzoj8G-PgLxP0wk_sAsWvNiFrmS2_xEJCkr9qw_YtrGj_1UQtroi/exec";

const role = localStorage.getItem("role");
const circle = localStorage.getItem("circle");

if (!role) window.location.href = "index.html";

async function loadApplications() {

  const response = await fetch(
    API_URL + "?action=applications&role=" + role + "&circle=" + circle
  );

  const data = await response.json();

  const tbody = document.querySelector("#nocTable tbody");
  tbody.innerHTML = "";

  let total = 0, pending = 0, approved = 0, rejected = 0;

  const circleFilter = document.getElementById("circleFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;
  const agingFilter = document.getElementById("agingFilter").value;

  data.forEach(app => {

    if (circleFilter && app.Circle !== circleFilter) return;
    if (statusFilter && app.Final_Status !== statusFilter) return;
    if (agingFilter && app.Days_Pending <= agingFilter) return;

    total++;

    if (app.Final_Status === "Approved") approved++;
    else if (app.Final_Status === "Rejected") rejected++;
    else pending++;

    const row = document.createElement("tr");

    if (app.Days_Pending > 30) row.classList.add("red-row");
    else if (app.Days_Pending > 15) row.classList.add("yellow-row");

    row.innerHTML = `
      <td>${app.Application_ID}</td>
      <td>${app.Circle}</td>
      <td>${app.Current_Status}</td>
      <td>${app.Status_Date}</td>
      <td>${app.Days_Pending}</td>
      <td class="${app.Final_Status.toLowerCase()}">${app.Final_Status}</td>
    `;

    tbody.appendChild(row);
  });

  document.getElementById("total").innerText = total;
  document.getElementById("pending").innerText = pending;
  document.getElementById("approved").innerText = approved;
  document.getElementById("rejected").innerText = rejected;
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

loadApplications();