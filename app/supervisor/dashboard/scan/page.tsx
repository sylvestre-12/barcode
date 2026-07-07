"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";


type Student = {
  id: string;
  name: string;
  studentId: string;
  department?: string | null;
};



export default function ScanPage() {


  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const scannedRef = useRef(false);



  const [result,setResult] = useState("");

  const [message,setMessage] = useState("");

  const [loading,setLoading] = useState(false);

  const [student,setStudent] = useState<Student | null>(null);







  useEffect(()=>{


    if(scannerRef.current) return;




    const scanner = new Html5QrcodeScanner(

      "reader",

      {

        fps:10,

        qrbox:{
          width:250,
          height:250,
        },


        rememberLastUsedCamera:true,

        showTorchButtonIfSupported:true,

        aspectRatio:1.0,

      },

      false

    );





    scannerRef.current = scanner;






    scanner.render(


      async(decodedText)=>{



        if(scannedRef.current) return;



        scannedRef.current = true;



        setResult(decodedText);

        setMessage("");

        setStudent(null);

        setLoading(true);





        try {



          const res = await fetch(
            "/api/scan",
            {

              method:"POST",

              headers:{
                "Content-Type":"application/json",
              },


              body:JSON.stringify({

                barcode:decodedText,

              }),

            }
          );






          const data = await res.json();





          if(!res.ok){


            setMessage(
              data.error || "Scan failed ❌"
            );


            return;

          }







          setMessage(

            data.message ||
            "Scan successful ✔"

          );







          if(data.student){


            setStudent(data.student);


          }






        } catch(error){


          console.error(
            "SCAN ERROR:",
            error
          );


          setMessage(
            "Server error ❌"
          );



        } finally {



          setLoading(false);




          setTimeout(()=>{


            scannedRef.current=false;



          },3000);



        }




      },



      ()=>{

        // camera scan errors ignored

      }


    );







    return ()=>{


      if(scannerRef.current){


        scannerRef.current
          .clear()
          .catch(()=>{});


        scannerRef.current=null;


      }


    };



  },[]);









  return (


    <div

      className="
      min-h-screen
      flex
      flex-col
      items-center
      justify-center
      bg-gray-100
      p-4
      "

    >




      <h1

        className="
        text-2xl
        font-bold
        mb-4
        "

      >

        📷 CheckInAI QR Scanner

      </h1>







      <div

        id="reader"

        className="
        w-full
        max-w-sm
        border
        rounded-xl
        overflow-hidden
        shadow-lg
        bg-white
        "

      />









      {result && (


        <div

          className="
          mt-4
          p-3
          bg-white
          rounded-xl
          w-full
          max-w-sm
          text-center
          shadow
          "

        >


          <p>

            <b>QR:</b> {result}

          </p>



        </div>


      )}









      {loading && (


        <p

          className="
          mt-3
          text-blue-600
          font-medium
          "

        >

          Processing scan...

        </p>


      )}








      {message && (


        <p

          className="
          mt-3
          text-green-600
          font-semibold
          "

        >

          {message}

        </p>


      )}









      {student && (


        <div

          className="
          mt-4
          w-full
          max-w-sm
          bg-white
          rounded-xl
          shadow
          p-5
          "

        >



          <h2

            className="
            text-xl
            font-bold
            "

          >

            {student.name}

          </h2>





          <p>

            ID:

            <span className="font-semibold">

              {" "}{student.studentId}

            </span>


          </p>






          <p className="text-gray-500">

            {student.department}

          </p>





        </div>


      )}







    </div>


  );


}