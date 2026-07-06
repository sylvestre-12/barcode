import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =======================================
// Generate Unique Student ID
// =======================================
async function generateStudentId(): Promise<string> {
  while (true) {
    const studentId =
      "STU-" + Math.floor(100000 + Math.random() * 900000);

    const exists = await prisma.student.findUnique({
      where: {
        studentId,
      },
    });

    if (!exists) {
      return studentId;
    }
  }
}


// =======================================
// GET ALL STUDENTS
// =======================================
export async function GET() {
  try {

    const students = await prisma.student.findMany({
      orderBy: {
        created_at: "desc",
      },
    });


    console.log(
      "STUDENTS FROM DATABASE:",
      students.length
    );


    return NextResponse.json(
      {
        success: true,
        count: students.length,

        // IMPORTANT
        // Frontend uses json.data
        data: students,
      },
      {
        status: 200,
      }
    );


  } catch (error) {

    console.error(
      "GET STUDENTS ERROR:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch students.",
      },
      {
        status: 500,
      }
    );

  }
}



// =======================================
// CREATE STUDENT
// =======================================
export async function POST(
  req: Request
) {

  try {

    const body = await req.json();


    const name =
      body.name?.trim();

    const email =
      body.email?.trim().toLowerCase();

    const department =
      body.className?.trim();



    // Validation
    if (
      !name ||
      !email ||
      !department
    ) {

      return NextResponse.json(
        {
          success:false,
          error:
          "Name, email and class are required.",
        },
        {
          status:400,
        }
      );

    }



    // Email validation

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if(
      !emailRegex.test(email)
    ){

      return NextResponse.json(
        {
          success:false,
          error:
          "Invalid email address.",
        },
        {
          status:400,
        }
      );

    }




    // Check duplicate email

    const existingStudent =
      await prisma.student.findUnique({

        where:{
          email,
        },

      });



    if(existingStudent){

      return NextResponse.json(
        {
          success:false,
          error:
          "Student email already exists.",
        },
        {
          status:409,
        }
      );

    }




    // Generate ID

    const studentId =
      await generateStudentId();



    // QR contains Student ID

    const qrCode =
      studentId;




    // Create student

    const student =
      await prisma.student.create({

        data:{

          studentId,

          name,

          email,

          department,

          qrCode,

        },

      });




    return NextResponse.json(
      {
        success:true,

        message:
        "Student created successfully.",

        student,

      },
      {
        status:201,
      }
    );



  } catch(error){


    console.error(
      "CREATE STUDENT ERROR:",
      error
    );


    return NextResponse.json(
      {
        success:false,
        error:
        "Internal server error.",
      },
      {
        status:500,
      }
    );


  }

}