"use client";

import { useEffect, useMemo, useState } from "react";
import StudentQR from "@/components/StudentQR";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


type Student = {
  id: string;
  studentId: string;
  name: string;
  email: string | null;
  department: string | null;
};



export default function StudentsPage() {


  const [students,setStudents] = useState<Student[]>([]);
  const [search,setSearch] = useState("");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");



  useEffect(()=>{

    loadStudents();

  },[]);



  async function loadStudents(){

    try{

      setLoading(true);


      const res = await fetch("/api/student/create");


      const json = await res.json();


      if(!res.ok){

        throw new Error(json.error);

      }


      setStudents(json.data || json.students || []);


    }catch(error){

      console.log(error);

      setError("Unable to load students.");

    }
    finally{

      setLoading(false);

    }

  }



  const filtered = useMemo(()=>{

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






  async function downloadPDF(id:string,name:string){


    const card=document.getElementById(id);


    if(!card)return;



    const canvas = await html2canvas(card,{
      scale:3,
      backgroundColor:"#ffffff"
    });



    const imgData = canvas.toDataURL("image/png");



    const pdf = new jsPDF({

      orientation:"portrait",

      unit:"mm",

      format:[90,55]

    });



    pdf.addImage(
      imgData,
      "PNG",
      5,
      5,
      80,
      45
    );



    pdf.save(
      `${name}-student-card.pdf`
    );


  }






  function printCard(id:string){


    const card=document.getElementById(id);


    if(!card)return;


    const win=window.open("","_blank");


    if(!win)return;



    win.document.write(`

    <html>

    <head>

    <title>
    Silver Foundation Student Card
    </title>


    <style>

    body{

      display:flex;

      justify-content:center;

      align-items:center;

      height:100vh;

      font-family:Arial;

    }


    </style>


    </head>


    <body>

    ${card.outerHTML}


    </body>


    </html>

    `);



    win.document.close();

    win.print();

  }





return (

<main className="min-h-screen bg-gray-100 p-8">


<div className="max-w-7xl mx-auto">


<h1 className="text-4xl font-bold">

Silver Foundation

</h1>


<p className="text-gray-500 mb-8">

Student Identity Cards

</p>




<input

placeholder="Search student..."

className="
w-full
p-3
rounded-xl
border
mb-8
"

value={search}

onChange={
e=>setSearch(e.target.value)
}

/>




{loading && <p>Loading...</p>}


{error &&

<p className="text-red-600">

{error}

</p>

}





<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">



{filtered.map(student=>(



<div key={student.id}>


<div

id={student.id}

className="
w-[350px]
h-[220px]
bg-white
rounded-2xl
shadow-xl
border
p-5
relative
overflow-hidden
"


>



<div className="
text-center
border-b
pb-2
">


<h2 className="
font-bold
text-xl
text-blue-800
">

Silver Foundation

</h2>


<p className="text-xs text-gray-500">

Student Identification Card

</p>


</div>





<div className="
flex
items-center
justify-between
mt-4
">



<div>


<h3 className="
font-bold
text-lg
">

{student.name}

</h3>


<p>

ID:
<b>
{student.studentId}
</b>

</p>


<p className="text-sm">

{student.department}

</p>


<p className="text-xs">

{student.email}

</p>



</div>




<div className="
bg-white
p-2
rounded-lg
border
">

<StudentQR

value={student.studentId}

/>


</div>



</div>





</div>





<div className="flex gap-2 mt-4">


<button

onClick={()=>downloadPDF(
student.id,
student.name
)}

className="
flex-1
bg-green-600
text-white
py-2
rounded-lg
"

>

Download PDF

</button>





<button

onClick={()=>printCard(student.id)}

className="
flex-1
bg-blue-600
text-white
py-2
rounded-lg
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