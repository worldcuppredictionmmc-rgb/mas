import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getMessaging,
    getToken
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js";


const firebaseConfig = {

  apiKey: "AIzaSyC3lAw9yJ6lBnCoaLJpYwOuJLJ8gmxm24o",

  authDomain: "mass-register-b9715.firebaseapp.com",

  projectId: "mass-register-b9715",

  storageBucket: "mass-register-b9715.firebasestorage.app",

  messagingSenderId: "987133106693",

  appId: "1:987133106693:web:a3e0b1c0776329e48c9a6c"

};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

const db = getFirestore(app);

const auth = getAuth(app);

Notification.requestPermission().then(async(permission)=>{

    if(permission==="granted"){

        const token = await getToken(messaging,{

            vapidKey:"BBRB0U9KWhtu5b4imvysz67sKB4H__bvN96KcC_ZlJkxLqvLqDO2KL46NhkAUJdisvnn2hVMX3Dpu7o4klGYm6g"

        });

        console.log("FCM TOKEN:");

        console.log(token);

        auth.onAuthStateChanged(async (user) => {

    if (!user) return;

    await setDoc(
        doc(db, "users", user.uid),
        {
            notificationToken: token
        },
        {
            merge: true
        }
    );

    console.log("✅ Token saved to Firestore");

});

    }

});
