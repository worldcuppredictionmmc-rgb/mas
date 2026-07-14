import {
    auth,
    db,
    collection,
    getDocs,
    query,
    where
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const exportPdfBtn = document.getElementById("exportPdfBtn");
const welcomeName = document.getElementById("welcomeName");
const dioceseName = document.getElementById("dioceseName");
const parishName = document.getElementById("parishName");
const logoutBtn = document.getElementById("logoutBtn");
const yearSelect = document.getElementById("yearSelect");
const addYearBtn = document.getElementById("addYearBtn");
let selectedYear = "2026";

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";
        return;

    }

    const docRef = doc(db, "users", user.uid);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

    const userData = docSnap.data();

welcomeName.innerHTML =
`👋 Welcome, <b>${userData.name}</b>`;

dioceseName.innerHTML =
`📍 ${userData.diocese || ""}`;

parishName.innerHTML =
`⛪ ${userData.parish || ""}`;

}

await loadYears(user);

await loadDashboardStats(user);

});

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "index.html";

});

addYearBtn.addEventListener("click", async () => {

    const year = prompt("Enter New Year");
    const settingsRef = doc(
    db,
    "users",
    auth.currentUser.uid,
    "settings",
    "app"
);

const settingsSnap = await getDoc(settingsRef);

let years = ["2026"];

if (settingsSnap.exists()) {

    years = settingsSnap.data().years || ["2026"];

}
if (years.includes(year)) {

    alert("Year already exists.");

    return;

}

years.push(year);

    if (!year) return;

    const option = document.createElement("option");

    option.value = year;
    option.textContent = year;

    yearSelect.appendChild(option);

    yearSelect.value = year;

    await setDoc(settingsRef, {

    years: years

});
await loadYears(auth.currentUser);

});

yearSelect.addEventListener("change", () => {

    selectedYear = yearSelect.value;

    loadDashboardStats(auth.currentUser);

});



const receivedCount = document.getElementById("receivedCount");
const completedCount = document.getElementById("completedCount");
const remainingCount = document.getElementById("remainingCount");
const totalAmount = document.getElementById("totalAmount");


async function loadYears(user) {

    const settingsRef = doc(
        db,
        "users",
        user.uid,
        "settings",
        "app"
    );

    const settingsSnap = await getDoc(settingsRef);

    yearSelect.innerHTML = "";

    let years = ["2026"];

    if (settingsSnap.exists()) {
        years = settingsSnap.data().years || ["2026"];
    }

    years.forEach(year => {

        const option = document.createElement("option");

        option.value = year;
        option.textContent = year;

        yearSelect.appendChild(option);

    });

    yearSelect.value = selectedYear;

}


export async function loadDashboardStats(user){

    const q = query(

    collection(
        db,
        "users",
        user.uid,
        "entries"
    ),

    where("year", "==", selectedYear)

);

const snapshot = await getDocs(q);

    let received = 0;
    let celebrated = 0;
    let amount = 0;
    const monthStats = {};

    snapshot.forEach(doc => {

    const data = doc.data();

    received++;

    if(data.celebrated){

        celebrated++;

    }

    amount += Number(data.amount || 0);

    // Month Statistics
    if (!monthStats[data.month]) {

       monthStats[data.month] = {
    count: 0,
    amount: 0,
    pending: 0
};

    }

    monthStats[data.month].count++;

monthStats[data.month].amount += Number(data.amount || 0);

if(!data.celebrated){

    monthStats[data.month].pending++;

}
});

    receivedCount.innerText = received;

    document.querySelectorAll(".month-card").forEach(card => {

    const month = card.dataset.month;

    const stats = monthStats[month];

    card.querySelector(".month-count").innerText =
    stats ? `📥 ${stats.count} Entries` : "📥 0 Entries";

card.querySelector(".month-pending").innerText =
    stats ? `⏳ ${stats.pending} Pending` : "⏳ 0 Pending";

card.querySelector(".month-amount").innerText =
    stats ? `💰 ₹${stats.amount}` : "💰 ₹0";

});

    completedCount.innerText = celebrated;

    remainingCount.innerText = received - celebrated;

    totalAmount.innerText = `Rs. ${amount.toLocaleString("en-IN")}`;

}

