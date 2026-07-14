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

// =========================
// Elements
// =========================

const exportPdfBtn = document.getElementById("exportPdfBtn");

const pdfModal = document.getElementById("pdfModal");

const closePdfModal = document.getElementById("closePdfModal");

const cancelPdfBtn = document.getElementById("cancelPdfBtn");

const reportType = document.getElementById("reportType");

const monthGroup = document.getElementById("monthGroup");

const pdfMonth = document.getElementById("pdfMonth");

const pdfYear = document.getElementById("pdfYear");

const yearSelect = document.getElementById("yearSelect");

const generatePdfBtn = document.getElementById("generatePdfBtn");


// =========================
// Open Export Modal
// =========================

exportPdfBtn.addEventListener("click", () => {

    // Copy dashboard years
    pdfYear.innerHTML = yearSelect.innerHTML;

    pdfYear.value = yearSelect.value;

    // Default
    reportType.value = "monthly";
    monthGroup.style.display = "block";

    pdfModal.style.display = "flex";

});


// =========================
// Close Modal
// =========================

closePdfModal.onclick = () => {

    pdfModal.style.display = "none";

};

cancelPdfBtn.onclick = () => {

    pdfModal.style.display = "none";

};

window.addEventListener("click",(e)=>{

    if(e.target===pdfModal){

        pdfModal.style.display="none";

    }

});


// =========================
// Report Type Change
// =========================

reportType.addEventListener("change",()=>{

    if(reportType.value==="yearly"){

        monthGroup.style.display="none";

    }

    else{

        monthGroup.style.display="block";

    }

});


// =========================
// Generate Button
// =========================

generatePdfBtn.addEventListener("click",async()=>{

    generatePdfBtn.disabled=true;

    generatePdfBtn.innerText="Generating...";

    try{

        if(reportType.value==="monthly"){

            await generateMonthlyPDF();

        }

        else{

            await generateYearlyPDF();

        }

        pdfModal.style.display="none";

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

    generatePdfBtn.disabled=false;

    generatePdfBtn.innerText="Export PDF";

});


// =========================
// Helper
// =========================

async function getUserProfile(){

    const user=auth.currentUser;

    const snap=await getDoc(

        doc(db,"users",user.uid)

    );

    return{

        user,

        profile:snap.data()

    };

}


// =========================
// PART 2
// =========================

async function generateMonthlyPDF(){

    const { jsPDF } = window.jspdf;

    const { user, profile } = await getUserProfile();

    // Firestore Query
    const q = query(

        collection(
            db,
            "users",
            user.uid,
            "entries"
        ),

        where("year","==",pdfYear.value),

        where("month","==",pdfMonth.value)

    );

    const snapshot = await getDocs(q);

    const rows = [];

    let totalAmount = 0;
    let celebrated = 0;

    snapshot.forEach(doc=>{

        const data = doc.data();

        const formattedDate =
        data.date.split("-").reverse().join("-");

        rows.push([

            formattedDate,

            data.type,

            data.remark || "-",

            `Rs. ${Number(data.amount).toLocaleString("en-IN")}`,

            data.celebrated
            ? "Celebrated"
            : "Pending"

        ]);

        totalAmount += Number(data.amount || 0);

        if(data.celebrated){

            celebrated++;

        }

    });

    const pdf = new jsPDF();

    // Header

    pdf.setFontSize(22);

    pdf.text("MASS REGISTER",105,20,{
        align:"center"
    });

    pdf.setFontSize(16);

    pdf.text(
        profile.parish || "",
        105,
        32,
        {align:"center"}
    );

    pdf.setFontSize(13);

    pdf.text(
        profile.diocese || "",
        105,
        40,
        {align:"center"}
    );

    pdf.line(20,52,190,52);

    pdf.setFontSize(15);

    pdf.text("MONTHLY REPORT",20,64);

    pdf.setFontSize(12);

    pdf.text(
        `Month : ${pdfMonth.value}`,
        20,
        74
    );

    pdf.text(
        `Year : ${pdfYear.value}`,
        20,
        82
    );

    pdf.autoTable({

        startY:90,

        head:[[
            "Date",
            "Type",
            "Remark",
            "Amount",
            "Status"
        ]],

        body:rows,

        theme:"grid",

        headStyles:{
            fillColor:[37,99,235]
        }

    });

    const finalY =
    pdf.lastAutoTable.finalY + 15;

    pdf.setFontSize(12);

    pdf.text(
        `Total Entries : ${snapshot.size}`,
        20,
        finalY
    );

    pdf.text(
        `Celebrated : ${celebrated}`,
        20,
        finalY+8
    );

    pdf.text(
        `Pending : ${snapshot.size-celebrated}`,
        20,
        finalY+16
    );

    pdf.text(
        `Total Amount : Rs. ${totalAmount.toLocaleString("en-IN")}`,
        20,
        finalY+24
    );

    pdf.setFontSize(10);

    pdf.text(

        `Generated on ${new Date().toLocaleDateString("en-IN")}`,

        20,

        finalY+38

    );

    pdf.save(

        `${pdfMonth.value}-${pdfYear.value}-Mass-Register.pdf`

    );

}


// =========================
// PART 3
// =========================

async function generateYearlyPDF(){

    const { jsPDF } = window.jspdf;

    const { user, profile } = await getUserProfile();

    // ===========================
    // Firestore Query
    // ===========================

    const q = query(

        collection(
            db,
            "users",
            user.uid,
            "entries"
        ),

        where("year","==",pdfYear.value)

    );

    const snapshot = await getDocs(q);

    // ===========================
    // Month Statistics
    // ===========================

    const monthStats = {};

    snapshot.forEach(doc=>{

        const data = doc.data();

        if(!monthStats[data.month]){

            monthStats[data.month]={

                entries:0,

                celebrated:0,

                amount:0

            };

        }

        monthStats[data.month].entries++;

        if(data.celebrated){

            monthStats[data.month].celebrated++;

        }

        monthStats[data.month].amount +=
        Number(data.amount || 0);

    });

    // ===========================
    // Create Rows
    // ===========================

    const rows=[];

    let totalEntries=0;
    let totalCelebrated=0;
    let totalAmount=0;

    const monthOrder=[

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];

    monthOrder.forEach(month=>{

        if(monthStats[month]){

            const stats=monthStats[month];

            rows.push([

                month,

                stats.entries,

                stats.celebrated,

                stats.entries-stats.celebrated,

                `Rs. ${stats.amount.toLocaleString("en-IN")}`

            ]);

            totalEntries+=stats.entries;

            totalCelebrated+=stats.celebrated;

            totalAmount+=stats.amount;

        }

    });

    // ===========================
    // Create PDF
    // ===========================

    const pdf=new jsPDF();

    pdf.setFontSize(22);

    pdf.text("MASS REGISTER",105,20,{
        align:"center"
    });

    pdf.setFontSize(16);

    pdf.text(
        profile.parish || "",
        105,
        32,
        {align:"center"}
    );

    pdf.setFontSize(13);

    pdf.text(
        profile.diocese || "",
        105,
        40,
        {align:"center"}
    );

    pdf.line(20,52,190,52);

    pdf.setFontSize(15);

    pdf.text("YEARLY REPORT",20,64);

    pdf.setFontSize(12);

    pdf.text(
        `Year : ${pdfYear.value}`,
        20,
        74
    );

    // ===========================
    // Table
    // ===========================

    pdf.autoTable({

        startY:85,

        head:[[
            "Month",
            "Entries",
            "Celebrated",
            "Pending",
            "Amount"
        ]],

        body:rows,

        theme:"grid",

        headStyles:{
            fillColor:[37,99,235]
        }

    });

    // ===========================
    // Summary
    // ===========================

    const finalY=
    pdf.lastAutoTable.finalY+15;

    pdf.setFontSize(12);

    pdf.text(
        `Total Entries : ${totalEntries}`,
        20,
        finalY
    );

    pdf.text(
        `Celebrated : ${totalCelebrated}`,
        20,
        finalY+8
    );

    pdf.text(
        `Pending : ${totalEntries-totalCelebrated}`,
        20,
        finalY+16
    );

    pdf.text(
        `Total Amount : Rs. ${totalAmount.toLocaleString("en-IN")}`,
        20,
        finalY+24
    );

    pdf.setFontSize(10);

    pdf.text(

        `Generated on ${new Date().toLocaleDateString("en-IN")}`,

        20,

        finalY+38

    );

    pdf.save(

        `${pdfYear.value}-Mass-Register.pdf`

    );

}