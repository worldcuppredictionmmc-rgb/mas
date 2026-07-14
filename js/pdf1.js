import {
    auth,
    db,
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "./firebase.js";

const pdfMonth = document.getElementById("pdfMonth");

const pdfYear = document.getElementById("pdfYear");

const exportPdfBtn = document.getElementById("exportPdfBtn");

const pdfModal = document.getElementById("pdfModal");

const closePdfModal = document.getElementById("closePdfModal");

const cancelPdfBtn = document.getElementById("cancelPdfBtn");

const yearSelect = document.getElementById("yearSelect");

const reportType = document.getElementById("reportType");
const monthGroup = document.getElementById("monthGroup");

const generatePdfBtn = document.getElementById("generatePdfBtn");

generatePdfBtn.addEventListener(async () => {

    if (reportType.value === "monthly") {

        await generateMonthlyPDF();

    } else {

        await generateYearlyPDF();

    }

});

async function generateYearlyPDF() {

    alert("Yearly PDF");

}

reportType.addEventListener("change", () => {

    if (reportType.value === "yearly") {

        monthGroup.style.display = "none";

    } else {

        monthGroup.style.display = "block";

    }

});

exportPdfBtn.addEventListener("click", () => {

    pdfYear.innerHTML = yearSelect.innerHTML;

    pdfYear.value = yearSelect.value;

    pdfModal.style.display = "flex";

});

closePdfModal.onclick = () => {

    pdfModal.style.display = "none";

};

cancelPdfBtn.onclick = () => {

    pdfModal.style.display = "none";

};

window.addEventListener("click", (e) => {

    if (e.target === pdfModal) {

        pdfModal.style.display = "none";

    }

});