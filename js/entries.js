import {
    auth,
    db,
    collection,
    getDocs,
    query,
    where,
    onAuthStateChanged
} from "./firebase.js";

import {
    openEntryForm,
    startEdit,
    removeEntry
} from "./entryForm.js";

const backBtn = document.getElementById("backBtn");
const monthTitle = document.getElementById("monthTitle");
const entryCount = document.getElementById("entryCount");
const entriesList = document.getElementById("entriesList");

const params = new URLSearchParams(window.location.search);

const selectedMonth = params.get("month");

const selectedYear = params.get("year") || "2026";

monthTitle.innerHTML = `📖 ${selectedMonth} ${selectedYear}`;

backBtn.addEventListener("click", () => {

    window.location.href = "dashboard.html";

});

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";
        return;

    }

    currentUser = user;

    await loadEntries();

});

async function loadEntries() {

    entriesList.innerHTML = `
        <div class="loading">
            ⏳ Loading Entries...
        </div>
    `;

    const q = query(

        collection(
            db,
            "users",
            currentUser.uid,
            "entries"
        ),

        where("month", "==", selectedMonth),

        where("year", "==", selectedYear)

    );

    const snapshot = await getDocs(q);

    entryCount.innerHTML = `${snapshot.size} Entries`;

    if (snapshot.empty) {

        entriesList.innerHTML = `
            <div class="loading">
                No Entries Found
            </div>
        `;

        return;

    }

    entriesList.innerHTML = "";

    snapshot.forEach(doc => {

        const data = doc.data();

        entriesList.innerHTML += `

<div class="entry-card">

<h3>📅 ${formatDate(data.date)}</h3>

<p><b>🏷️ ${data.type}</b></p>

<p>📝 ${data.remark || "-"}</p>

${data.amount ? `<p>💰 ₹${data.amount}</p>` : ""}

<p class="${data.celebrated ? "status" : "pending"}">

${data.celebrated ? "🟢 Celebrated" : "🔴 Pending"}

</p>

<div class="entry-actions">

<button
class="edit-btn"
data-id="${doc.id}">

✏ Edit

</button>

<button
class="delete-btn"
data-id="${doc.id}">

🗑 Delete

</button>

</div>

</div>

`;

    });

   document.querySelectorAll(".edit-btn").forEach(btn => {

    btn.onclick = () => {

        const id = btn.dataset.id;

        const data = snapshot.docs.find(d => d.id === id).data();

        data.month = selectedMonth;
data.year = selectedYear;

        startEdit(id, data);

    };

});

document.querySelectorAll(".delete-btn").forEach(btn => {

    btn.onclick = async () => {

        await removeEntry(btn.dataset.id, async () => {

            await loadEntries();

            entryCount.innerText =
                `${document.querySelectorAll(".entry-card").length} Entries`;

        });

    };

});
}


function formatDate(date){

    const [year,month,day] = date.split("-");

    return `${day}-${month}-${year}`;

}

// -------------------------
// MODAL
// -------------------------

const addEntryBtn = document.getElementById("addEntryBtn");
addEntryBtn.addEventListener("click", () => {

    openEntryForm(selectedMonth, selectedYear);

});



