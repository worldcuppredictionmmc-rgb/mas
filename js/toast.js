const toast=document.getElementById("toast");

export function showToast(message,type="success"){

    toast.innerText=message;

    toast.className="";

    if(type==="error"){

        toast.classList.add("error");

    }

    if(type==="warning"){

        toast.classList.add("warning");

    }

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}