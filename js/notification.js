import {
    db,
    auth
} from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

function formatDate(date){

    return date.toISOString().split("T")[0];

}

const today = new Date();

const tomorrow = new Date();

tomorrow.setDate(today.getDate()+1);

const todayString = formatDate(today);

const tomorrowString = formatDate(tomorrow);

const notificationBtn =
document.getElementById("notificationBtn");

const notificationPanel =
document.getElementById("notificationPanel");

export async function loadNotifications(user){

    console.log("DB:", db);
console.log("USER:", user);
    const entriesRef = collection(
        db,
        "users",
        user.uid,
        "entries"
    );

    // baki code same


    const todayQuery = query(
        entriesRef,
        where("date","==",todayString)
    );

    const tomorrowQuery = query(
        entriesRef,
        where("date","==",tomorrowString)
    );

    const todaySnapshot =
        await getDocs(todayQuery);

    const tomorrowSnapshot =
        await getDocs(tomorrowQuery);

    console.log(
        "Today:",
        todaySnapshot.size
    );

    console.log(
        "Tomorrow:",
        tomorrowSnapshot.size
    );

    const notificationList =
document.getElementById("notificationList");

let html = "";

    if(todaySnapshot.size > 0){

    html += `
    <div class="notification-section">

        <h4>📅 Today</h4>
    `;

    todaySnapshot.forEach(doc=>{

        const data = doc.data();

        html += `
        <div class="notification-item">

            <strong>${data.type}</strong>

            <p>${data.remark}</p>

        </div>
        `;

    });

    html += `</div>`;
}

    if(tomorrowSnapshot.size > 0){

    html += `
    <div class="notification-section">

        <h4>🔔 Tomorrow</h4>
    `;

    tomorrowSnapshot.forEach(doc=>{

        const data = doc.data();

        html += `
        <div class="notification-item">

            <strong>${data.type}</strong>

            <p>${data.remark}</p>

        </div>
        `;

    });

    html += `</div>`;
}

    if(html === ""){

    html = `
    <div class="notification-empty">

        <i class="fa-solid fa-circle-check"></i>

        <p>You're all caught up!</p>

        <small>No pending reminders.</small>

    </div>
    `;

}

notificationList.innerHTML = html;

const notificationCount =
document.getElementById("notificationCount");

notificationCount.innerText =
todaySnapshot.size + tomorrowSnapshot.size;

if (todaySnapshot.size + tomorrowSnapshot.size === 0) {

    notificationCount.style.display = "none";

} else {

    notificationCount.style.display = "flex";

}

}

notificationBtn.addEventListener("click",(e)=>{

    e.stopPropagation();

    notificationPanel.classList.toggle("show");

});

document.addEventListener("click",(e)=>{

    if(
        !notificationPanel.contains(e.target)
        &&
        !notificationBtn.contains(e.target)
    ){

        notificationPanel.classList.remove("show");

    }

});


auth.onAuthStateChanged((user)=>{

    if(!user) return;

    loadNotifications(user);

});