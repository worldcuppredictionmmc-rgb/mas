import {
    auth,
    db,
    collection,
    addDoc,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    doc
} from "./firebase.js";


import { showToast } from "./toast.js";

let editingId = null;

const modal = document.getElementById("massModal");

const saveBtn = document.getElementById("saveBtn");
const closeBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

const massDate = document.getElementById("massDate");
const massType = document.getElementById("massType");
const remark = document.getElementById("remark");
const amount = document.getElementById("amount");
const celebrated = document.getElementById("celebrated");

let selectedMonth = "";
let selectedYear = "2026";

export function openEntryForm(month, year) {

    selectedMonth = month;
    selectedYear = year;

    editingId = null;

    resetForm();

    document.getElementById("modalTitle").innerHTML =
        `✝ Add ${month} Entry`;

    modal.style.display = "flex";

}

export function closeEntryForm() {

    modal.style.display = "none";

    resetForm();

}

closeBtn.onclick = closeEntryForm;
cancelBtn.onclick = closeEntryForm;

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        closeEntryForm();

    }

});

function resetForm() {

    editingId = null;

    massDate.value = "";
    massType.selectedIndex = 0;
    remark.value = "";
    amount.value = "";
    celebrated.checked = false;

    saveBtn.innerText = "Save";

}

export async function saveEntry(afterSave = null) {

    if (!massDate.value) {

        showToast("Select a date", "warning");
        return;

    }

    saveBtn.disabled = true;
    saveBtn.innerText = "Saving...";

    try {

        const data = {

            year: selectedYear,
            month: selectedMonth,
            date: massDate.value,
            type: massType.value,
            remark: remark.value,
            amount: Number(amount.value) || 0,
            celebrated: celebrated.checked

        };

        if (editingId) {

            await updateDoc(

                doc(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "entries",
                    editingId
                ),

                data

            );

            showToast("Entry Updated");

        } else {

            data.createdAt = serverTimestamp();

            await addDoc(

                collection(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "entries"
                ),

                data

            );

            showToast("Entry Saved");

        }

        closeEntryForm();

        if (afterSave) {

    await afterSave();

} else {

    window.location.reload();

}
    } catch (err) {

        console.error(err);

        showToast("Failed", "error");

    }

    saveBtn.disabled = false;
    saveBtn.innerText = "Save";

}

saveBtn.onclick = () => saveEntry();

export function startEdit(id, data) {

    editingId = id;

    selectedMonth = data.month;
    selectedYear = data.year;

    massDate.value = data.date;
    massType.value = data.type;
    remark.value = data.remark || "";
    amount.value = data.amount || "";
    celebrated.checked = data.celebrated;

    saveBtn.innerText = "Update Entry";

    modal.style.display = "flex";

}


export async function removeEntry(id, afterDelete = null) {

    if (!confirm("Delete this entry?")) return;

    try {

        await deleteDoc(
            doc(
                db,
                "users",
                auth.currentUser.uid,
                "entries",
                id
            )
        );

        showToast("🗑 Entry Deleted Successfully");

        if (afterDelete) {

    await afterDelete();

} else {

    window.location.reload();

}

    } catch (err) {

        console.error(err);

        showToast("Delete Failed", "error");

    }

}