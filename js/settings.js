import {
    auth,
    db,
    doc,
    getDoc,
    updateDoc,
    onAuthStateChanged
} from "./firebase.js";

const name = document.getElementById("name");
const email = document.getElementById("email");
const diocese = document.getElementById("diocese");
const parish = document.getElementById("parish");
const saveBtn = document.getElementById("saveBtn");

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.history.back();
        return;

    }

    const docRef = doc(db, "users", user.uid);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

        const data = docSnap.data();

        name.value = data.name || "";
        email.value = data.email || "";
        diocese.value = data.diocese || "";
        parish.value = data.parish || "";

    }

});


saveBtn.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) return;

    try {

        await updateDoc(

            doc(db, "users", user.uid),

            {
                name: name.value,
                diocese: diocese.value,
                parish: parish.value
            }

        );

        alert("✅ Profile Updated Successfully!");

    } catch (error) {

        alert(error.message);

    }

});
