"use client";

import { useEffect, useMemo, useState } from "react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import StudentBarcode from "@/components/StudentBarcode";


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


      setStudents(json.data || []);


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







  async function downloadPDF(
    id:string,
    name:string,
    studentId:string
  ){


    const card = document.getElementById(id);


    if(!card)return;



    const canvas = await html2canvas(card,{

      scale:5,
      useCORS:true,
      backgroundColor:"#ffffff",
      foreignObjectRendering:false,
      logging:false

    });



    const image = canvas.toDataURL("image/png");



    const pdf = new jsPDF({

      orientation:"landscape",
      unit:"mm",
      format:[86,54]

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



    const windowPrint = window.open(
      "",
      "_blank"
    );


    if(!windowPrint)return;



    windowPrint.document.write(`

    <html>

    <head>

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








return (

<main className="min-h-screen bg-gray-100 p-8">


<div className="max-w-7xl mx-auto">


<h1 className="text-4xl font-bold">

Silver Foundation

</h1>



<p className="text-gray-500 mb-8">

Barcode Student Identification Cards

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





<div

id={student.id}

style={{

width:"86mm",

height:"54mm",

borderRadius:"16px",

overflow:"hidden",

background:
"linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)",

color:"#ffffff",

padding:"16px",

display:"flex",

flexDirection:"column",

justifyContent:"space-between"

}}


>





<div

style={{

textAlign:"center",

borderBottom:"1px solid rgba(255,255,255,0.3)",

paddingBottom:"8px"

}}

>



<h1

style={{

fontSize:"18px",

fontWeight:"700",

letterSpacing:"0.05em"

}}

>

Silver Foundation

</h1>




<p

style={{

fontSize:"10px",

opacity:0.8

}}

>

STUDENT BARCODE CARD

</p>



</div>









<div

style={{

display:"flex",

alignItems:"center",

justifyContent:"center",

flex:1,

background:"#ffffff",

borderRadius:"12px",

padding:"12px"

}}

>



<StudentBarcode

value={student.studentId}

width={2.2}

height={65}

/>



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