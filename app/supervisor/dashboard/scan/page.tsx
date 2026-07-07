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

        fps: 10,


        qrbox: {

          width: 320,

          height: 160,

        },


        rememberLastUsedCamera:true,


        showTorchButtonIfSupported:true,


        aspectRatio:1.777,


        formatsToSupport:[

          8 // CODE128 barcode

        ],


      },


      false

    );






    scannerRef.current = scanner;







    scanner.render(


      async(decodedText:string)=>{


        if(scannedRef.current) return;



        scannedRef.current = true;



        setResult(decodedText);

        setMessage("");

        setStudent(null);

        setLoading(true);





        try {



          const response = await fetch(

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







          const data = await response.json();







          if(!response.ok){


            setMessage(

              data.error ||

              "Barcode not recognized ❌"

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






        }catch(error){


          console.error(

            "SCAN ERROR",

            error

          );


          setMessage(

            "Server connection failed ❌"

          );



        }finally{


          setLoading(false);




          setTimeout(()=>{


            scannedRef.current=false;



          },3000);



        }




      },



      (errorMessage)=>{

        // ignore continuous camera searching errors

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

    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white flex flex-col items-center justify-center p-5">



      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">



        <h1 className="text-2xl font-bold text-center mb-2">

          📷 CheckInAI Barcode Scanner

        </h1>




        <p className="text-gray-500 text-center mb-5">

          Scan student ID barcode

        </p>





        <div

          id="reader"

          className="

          overflow-hidden

          rounded-xl

          border

          bg-black

          "

        />







        {loading && (

          <p className="text-blue-600 text-center mt-4 font-semibold">

            Processing scan...

          </p>

        )}







        {result && (

          <div className="mt-4 bg-gray-100 rounded-xl p-3">

            <p className="font-semibold">

              Barcode:

            </p>


            <p className="break-all text-sm">

              {result}

            </p>


          </div>

        )}







        {message && (

          <div className="mt-4 text-center">


            <p className="font-bold text-green-600">

              {message}

            </p>


          </div>

        )}








        {student && (

          <div className="mt-5 bg-green-50 rounded-xl p-5">


            <h2 className="text-xl font-bold">

              {student.name}

            </h2>




            <p className="mt-2">

              Student ID:

              <span className="font-semibold">

                {" "}{student.studentId}

              </span>

            </p>





            <p className="text-gray-600">

              {student.department}

            </p>



          </div>

        )}






      </div>



    </main>

  );


}