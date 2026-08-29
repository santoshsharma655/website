(function () {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyDBTUPWMsA2EhqC8PFhmahw5h5r_OPkJ2Y",
    authDomain: "pmo-relief-fund.firebaseapp.com",
    projectId: "pmo-relief-fund",
    storageBucket: "pmo-relief-fund.firebasestorage.app",
    messagingSenderId: "327488698125",
    appId: "1:327488698125:web:9a3a2d6749ca9b75dae244"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  const db = firebase.firestore();

  const tableBody = document.getElementById("donorTableBody");
  const totalAmountEl = document.getElementById("totalAmount");
  const totalDonorsEl = document.getElementById("totalDonors");
  const emptyStateEl = document.getElementById("emptyState");
  const errorStateEl = document.getElementById("errorState");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  function formatCurrency(amount) {
    const safeAmount = Number(amount) || 0;
    return "रु. " + safeAmount.toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function buildRow(serialNumber, donor) {
    const name = escapeHtml(donor.name || "अज्ञात दाता");
    const program = escapeHtml(donor.program || "—");
    const amountValue = Number(donor.amount) || 0;
    const amountDisplay = amountValue.toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });
    const proofUrl = donor.proofUrl ? String(donor.proofUrl) : "";

    const receiptCell = proofUrl
      ? '<a class="receipt-btn" href="' + escapeHtml(proofUrl) + '" target="_blank" rel="noopener noreferrer">View Proof</a>'
      : '<span class="receipt-btn disabled">Not Available</span>';

    return (
      "<tr>" +
      "<td>" + serialNumber + "</td>" +
      '<td class="donor-name">' + name + "</td>" +
      '<td class="donor-program">' + program + "</td>" +
      '<td class="donor-amount">' + amountDisplay + "</td>" +
      "<td>" + receiptCell + "</td>" +
      "</tr>"
    );
  }

  function renderDonors(donors) {
    errorStateEl.hidden = true;

    if (!donors.length) {
      tableBody.innerHTML = "";
      emptyStateEl.hidden = false;
      totalAmountEl.textContent = formatCurrency(0);
      totalDonorsEl.textContent = "०";
      return;
    }

    emptyStateEl.hidden = true;

    let rowsHtml = "";
    let total = 0;

    donors.forEach(function (donor, index) {
      total += Number(donor.amount) || 0;
      rowsHtml += buildRow(index + 1, donor);
    });

    tableBody.innerHTML = rowsHtml;
    totalAmountEl.textContent = formatCurrency(total);
    totalDonorsEl.textContent = donors.length.toLocaleString("en-IN");
  }

  function renderError() {
    tableBody.innerHTML = "";
    emptyStateEl.hidden = true;
    errorStateEl.hidden = false;
  }

  db.collection("donations")
    .orderBy("timestamp", "asc")
    .onSnapshot(
      function (snapshot) {
        const donors = [];
        snapshot.forEach(function (doc) {
          donors.push(doc.data());
        });
        renderDonors(donors);
      },
      function (error) {
        console.error("Firestore listener error:", error);
        renderError();
      }
    );
})();