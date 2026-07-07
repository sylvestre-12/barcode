"use client";

import { useEffect, useMemo, useState } from "react";
import StudentQR from "@/components/StudentQR";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";




type Student = {
  id:string;
  studentId:string;
  name:string;
  email:string | null;
  department:string | null;
};



export default function StudentsPage(){


const [students,setStudents]=useState<Student[]>([]);
const [search,setSearch]=useState("");
const [loading,setLoading]=useState(true);
const [error,setError]=useState("");



useEffect(()=>{

loadStudents();

},[]);



async function loadStudents(){

try{

setLoading(true);


const res=await fetch("/api/student/create");


const json=await res.json();


if(!res.ok){

throw new Error(json.error);

}


setStudents(json.data || []);


}catch(error){

console.log(error);

setError("Unable to load students.");

}
finally{

setLoading(false);

}

}





const filtered=useMemo(()=>{


return students.filter(student=>

(
student.name+
student.studentId+
(student.email ?? "")+
(student.department ?? "")
)
.toLowerCase()
.includes(search.toLowerCase())


);


},[students,search]);







async function downloadPDF(
  id: string,
  name: string,
  studentId: string
) {

  const card = document.getElementById(id);

  if (!card) {
    console.log("Card not found");
    return;
  }


  const canvas = await html2canvas(card, {
    scale: 5,
    useCORS: true,
    backgroundColor: "#ffffff",
  });


  const image = canvas.toDataURL("image/png");


  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [86, 54],
  });


  pdf.addImage(
    image,
    "PNG",
    0,
    0,
    86,
    54
  );


  pdf.save(
    `${studentId}-${name}.pdf`
  );

}






function printCard(id:string){


const card=document.getElementById(id);


if(!card)return;



const windowPrint=window.open(
"",
"_blank"
);



if(!windowPrint)return;



windowPrint.document.write(`

<html>

<head>

<title>
Silver Foundation Student Card
</title>


<style>

@page{

size:86mm 54mm;

margin:0;

}


body{

margin:0;

display:flex;

justify-content:center;

align-items:center;

height:100vh;

}


.card{

width:86mm;

height:54mm;

}


</style>


</head>


<body>


<div class="card">

${card.outerHTML}

</div>


</body>


</html>

`);



windowPrint.document.close();



setTimeout(()=>{

windowPrint.print();

windowPrint.close();

},500);



}








return(


<main className="min-h-screen bg-gray-100 p-8">


<div className="max-w-7xl mx-auto">


<h1 className="text-4xl font-bold">

Silver Foundation

</h1>


<p className="text-gray-500 mb-8">

Official Student Identification Cards

</p>





<input

placeholder="Search student..."

className="
w-full
p-3
border
rounded-xl
mb-8
"

value={search}

onChange={(e)=>setSearch(e.target.value)}

/>







{loading && (

<p>
Loading students...
</p>

)}



{error && (

<p className="text-red-600">

{error}

</p>

)}








<div className="
grid
md:grid-cols-2
xl:grid-cols-3
gap-10
">





{filtered.map(student=>(



<div key={student.id}>


{/* CARD */}

<div

id={student.id}

className="
w-[86mm]
h-[54mm]
rounded-2xl
overflow-hidden
shadow-2xl
bg-gradient-to-br
from-slate-900
via-blue-900
to-blue-600
text-white
p-4
"


>




<div className="
flex
justify-between
items-start
border-b
border-white/30
pb-2
">


<div>

<h1 className="
text-lg
font-bold
tracking-wide
">

Silver Foundation

</h1>


<p className="
text-[10px]
opacity-80
">

STUDENT IDENTIFICATION CARD

</p>


</div>




<div className="
text-[10px]
bg-white/20
px-2
py-1
rounded
">

ACTIVE

</div>



</div>







<div className="
flex
justify-between
items-center
mt-3
">





<div className="
max-w-[160px]
">


<h2 className="
text-sm
font-bold
truncate
">

{student.name}

</h2>



<p className="text-xs">

ID:

<span className="font-bold">

{" "}{student.studentId}

</span>

</p>




<p className="
text-xs
truncate
">

{student.department}

</p>




<p className="
text-[10px]
opacity-80
truncate
">

{student.email || "No email"}

</p>



</div>







<div className="
bg-white
rounded-lg
p-1
">

<StudentQR

value={student.studentId}



/>


</div>




</div>





</div>







<div className="
flex
gap-3
mt-4
">



<button

onClick={()=>downloadPDF(

student.id,

student.name,

student.studentId

)}

className="
flex-1
bg-green-600
hover:bg-green-700
text-white
rounded-lg
py-2
font-semibold
"

>

Download PDF

</button>






<button

onClick={()=>printCard(student.id)}

className="
flex-1
bg-blue-600
hover:bg-blue-700
text-white
rounded-lg
py-2
font-semibold
"

>

Print

</button>




</div>





</div>



))}





</div>


</div>


</main>


);


}