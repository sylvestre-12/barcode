import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {

  try {


    const { barcode } = await req.json();



    if (!barcode) {

      return NextResponse.json(
        {
          error: "Missing barcode",
        },
        {
          status: 400,
        }
      );

    }




    // FIND STUDENT USING BARCODE VALUE
    // qrCode column can store barcode values
    const student = await prisma.student.findFirst({

      where: {
        qrCode: barcode,
      },

    });





    if (!student) {

      return NextResponse.json(
        {
          error: "Student not found",
        },
        {
          status:404,
        }
      );

    }






    // TODAY START AND END

    const startOfDay = new Date();

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );



    const endOfDay = new Date();

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );







    // FIND LAST SCAN TODAY

    const last =
      await prisma.attendanceRecord.findFirst({

        where: {

          student_id: student.id,

          created_at: {

            gte:startOfDay,

            lte:endOfDay,

          },

        },


        orderBy: {

          created_at:"desc",

        },


      });








    // PREVENT DOUBLE SCAN

    if(last){


      const difference =
        Date.now() -
        new Date(last.created_at).getTime();



      if(difference < 30000){



        return NextResponse.json(

          {
            error:
              "Too fast scan detected",
          },

          {
            status:429,
          }

        );


      }


    }








    // IF NO RECORD OR ALREADY CHECKED OUT
    // CREATE NEW CHECK IN

    const isCheckIn =
      !last ||
      last.check_out !== null;







    if(isCheckIn){


      const record =
        await prisma.attendanceRecord.create({

          data:{

            student_id:student.id,

            barcode:barcode,

            check_in:new Date(),

            status:"present",

            date:startOfDay,

          },


        });






      return NextResponse.json({

        success:true,

        action:"check-in",

        message:
          `${student.name} checked IN successfully`,

        student,

        record,

      });


    }









    // OTHERWISE UPDATE CHECK OUT

    const updated =
      await prisma.attendanceRecord.update({

        where:{

          id:last.id,

        },


        data:{

          check_out:new Date(),

        },


      });







    return NextResponse.json({

      success:true,

      action:"check-out",

      message:
        `${student.name} checked OUT successfully`,

      student,

      record:updated,

    });








  } catch(error){


    console.error(
      "SCAN_ERROR:",
      error
    );



    return NextResponse.json(

      {
        error:"Server error",
      },

      {
        status:500,
      }

    );


  }


}