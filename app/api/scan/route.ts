import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {

    const { barcode } = await req.json();


    if (!barcode) {
      return NextResponse.json(
        { error: "Missing barcode" },
        { status: 400 }
      );
    }



    // FIND STUDENT BY BARCODE
    const student = await prisma.student.findFirst({

      where: {
        qrCode: barcode,
      },

    });



    if (!student) {

      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );

    }





    // TODAY RANGE

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






    // FIND LAST ATTENDANCE TODAY

    const last = await prisma.attendanceRecord.findFirst({

      where: {

        student_id: student.id,

        created_at: {

          gte: startOfDay,

          lte: endOfDay,

        },

      },

      orderBy: {

        created_at: "desc",

      },

    });







    // ANTI SPAM CHECK

    if (last) {


      const diff =
        Date.now() -
        new Date(last.created_at).getTime();



      if (diff < 30 * 1000) {


        try {

          await prisma.anomaly.create({

            data: {

              user_id: student.id,

              type: "FAST_SCAN",

              severity: "HIGH",

              description:
                "Fast repeated scan detected",

            },

          });


        } catch(error) {

          console.log(
            "Anomaly log skipped:",
            error
          );

        }




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







    // CHECK IN OR CHECK OUT

    const isCheckIn =
      !last ||
      last.check_out !== null;







    // CREATE CHECK-IN

    if (isCheckIn) {


      const record =
        await prisma.attendanceRecord.create({

          data: {

            student_id: student.id,

            barcode,

            check_in: new Date(),

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








    // UPDATE CHECK-OUT

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






  } catch(err) {


    console.error(
      "SCAN_ERROR:",
      err
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