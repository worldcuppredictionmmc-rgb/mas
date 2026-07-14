import {
    auth,
    db,
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    query,
    where,
    deleteDoc,
    updateDoc,
    doc
} from "./firebase.js";

import { showToast } from "./toast.js";

import { loadDashboardStats } from "./dashboard.js";

import { loadNotifications } from "./notification.js";

const modal = document.getElementById("massModal");

const closeModal = document.getElementById("closeModal");

const cancelBtn = document.getElementById("cancelBtn");

const months = document.querySelectorAll(".month-card");

const yearSelect = document.getElementById("yearSelect");

yearSelect.addEventListener("change", () => {

    selectedYear = yearSelect.value;

});

const saveBtn = document.getElementById("saveBtn");

const massDate = document.getElementById("massDate");

const massType = document.getElementById("massType");

const remark = document.getElementById("remark");

const amount = document.getElementById("amount");

const celebrated = document.getElementById("celebrated");

let selectedMonth = "";

let selectedYear = "2026";

let editingId = null;

months.forEach(card => {

    card.addEventListener("click", () => {

        selectedMonth = card.dataset.month;

        editingId = null;

        resetForm();

        document.getElementById("modalTitle").innerHTML =
            `✝ Add ${selectedMonth} Entry`;

        modal.style.display = "flex";

        loadEntries();

    });

});

closeModal.onclick=()=>{

    resetForm();


modal.style.display="none";

}

cancelBtn.onclick=()=>{

    resetForm();


modal.style.display="none";

}

window.onclick=(e)=>{

if(e.target===modal){

    resetForm();


modal.style.display="none";

}

}

saveBtn.addEventListener("click", async () => {

    if (!massDate.value) {

        showToast("Please select a date","warning");

        return;

    }

    saveBtn.disabled = true;

    saveBtn.innerText = "Saving...";


    try {

    if (editingId) {

        // UPDATE EXISTING ENTRY
        await updateDoc(
            doc(
                db,
                "users",
                auth.currentUser.uid,
                "entries",
                editingId
            ),
            {
                date: massDate.value,
                type: massType.value,
                remark: remark.value,
                amount: Number(amount.value) || 0,
                celebrated: celebrated.checked
            }
        );

    } else {

        // ADD NEW ENTRY
        await addDoc(
            collection(
                db,
                "users",
                auth.currentUser.uid,
                "entries"
            ),
            {
                year: selectedYear,
                month: selectedMonth,
                date: massDate.value,
                type: massType.value,
                remark: remark.value,
                amount: Number(amount.value) || 0,
                celebrated: celebrated.checked,
                createdAt: serverTimestamp()
            }
        );

    }

    // Clear form
    massDate.value = "";
    massType.selectedIndex = 0;
    remark.value = "";
    amount.value = "";
    celebrated.checked = false;

    // Reset edit mode
    editingId = null;
    saveBtn.innerText = "Save";

    // Reload data
    await loadEntries();
    await loadDashboardStats(auth.currentUser);
    await loadNotifications(auth.currentUser);

showToast("✅ Entry Saved Successfully");
}
catch(error){

    showToast("Failed to Save","error");

}

    saveBtn.disabled = false;

    saveBtn.innerText = "Save";

});


export async function loadEntries(){

    const entriesList = document.getElementById("entriesList");

    entriesList.innerHTML=`

<div class="loading">

⏳ Loading Entries...

</div>

`;

    const q = query(

        collection(
            db,
            "users",
            auth.currentUser.uid,
            "entries"
        ),

        where("month","==",selectedMonth),

        where("year","==",selectedYear)

    );

    const snapshot = await getDocs(q);

    if(snapshot.empty){

        entriesList.innerHTML =
        "<p>No entries found.</p>";

        return;

    }

    entriesList.innerHTML="";

    snapshot.forEach(doc=>{

        const data = doc.data();
        const id = doc.id;

       entriesList.innerHTML += `
<div
class="entry-card"
data-date="${data.date}"
data-type="${data.type}"
data-remark="${data.remark}"
data-amount="${data.amount}"
data-celebrated="${data.celebrated}">

<h4>📅 ${formatDate(data.date)}</h4>

<p><b>🏷️ ${data.type}</b></p>

<p>📝 ${data.remark || "-"}</p>

${data.amount > 0 ? `<p>💰 ₹${data.amount}</p>` : ""}

<p class="${data.celebrated ? "status" : "pending"}">
${data.celebrated ? "🟢 Celebrated" : "🔴 Pending"}
</p>

<div class="entry-actions">
    <button class="edit-btn" data-id="${id}">✏ Edit</button>
    <button class="delete-btn" data-id="${id}">🗑 Delete</button>
</div>



</div>
`;

document.querySelectorAll(".edit-btn").forEach(button => {

    button.addEventListener("click", () => {

        editingId = button.dataset.id;

        const card = button.closest(".entry-card");

        massDate.value = card.dataset.date;
        massType.value = card.dataset.type;
        remark.value = card.dataset.remark;
        amount.value = card.dataset.amount;
        celebrated.checked = card.dataset.celebrated === "true";

        saveBtn.innerText = "Update Entry";

    });

});

    });


    document.querySelectorAll(".delete-btn").forEach(button => {

    button.addEventListener("click", async () => {

        const confirmDelete = confirm(
            "Are you sure you want to delete this entry?"
        );

        if (!confirmDelete) return;

        try {

            await deleteDoc(
                doc(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "entries",
                    button.dataset.id
                )
            );

            showToast("🗑 Entry Deleted");

            await loadDashboardStats(auth.currentUser);

            await loadEntries();

            await loadNotifications(auth.currentUser);

        } catch (error) {

            showToast("Failed to delete entry","error");

        }

    });

});

}

function formatDate(date){

    const [year, month, day] = date.split("-");

    return `${day}-${month}-${year}`;

}

function resetForm(){

    editingId = null;

    massDate.value = "";

    massType.selectedIndex = 0;

    remark.value = "";

    amount.value = "";

    celebrated.checked = false;

    saveBtn.innerText = "Save";

}

export function setSelectedMonth(month){

    selectedMonth = month;

}