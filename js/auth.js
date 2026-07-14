import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==========================
// REGISTER
// ==========================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

  registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();

    const diocese = document.getElementById("diocese");

    const parish = document.getElementById("parish");

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword =
      document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const button = registerForm.querySelector("button");

button.disabled = true;
button.innerText = "Creating...";

    try {

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await setDoc(doc(db, "users", userCredential.user.uid), {

        name: name,

        diocese: diocese.value,

        parish: parish.value,

        email: email,

        createdAt: new Date()

      });

      alert("Account Created Successfully!");

      button.innerText = "Account Created";

      window.location.href = "index.html";

    }

    catch (error) {

    button.disabled = false;

    button.innerText = "Create Account";

    alert(error.message);

}

  });

}



// ==========================
// LOGIN
// ==========================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login Successful!");

      window.location.href = "dashboard.html";

    }

    catch (error) {

      alert(error.message);

    }

  });

}

// ======================
// SHOW / HIDE PASSWORD
// ======================

const togglePasswords = document.querySelectorAll(".togglePassword");

console.log("Toggle Script Loaded");

togglePasswords.forEach(icon => {

    icon.addEventListener("click", () => {

      console.log("Eye clicked");

        const input = icon.previousElementSibling;

        if (input.type === "password") {

            input.type = "text";

            icon.classList.replace("fa-eye", "fa-eye-slash");

        } else {

            input.type = "password";

            icon.classList.replace("fa-eye-slash", "fa-eye");

        }

    });

});