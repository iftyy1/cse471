import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";
import { joinTutorSession } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const user = getAuthUser(request);
    const body = await request.json().catch(() => ({}));
    const student = typeof body.student === "string" ? body.student.trim() : "";

    if (!student) {
      return NextResponse.json({ error: "Student name is required" }, { status: 400 });
    }

    // Try database first
    try {
      // Get tutor
      const tutorResult = await query(
        `SELECT t.*, COUNT(ts.id) as enrolled_count
         FROM tutors t
         LEFT JOIN tutor_students ts ON t.id = ts.tutor_id
         WHERE t.id = $1
         GROUP BY t.id`,
        [id]
      );

      if (tutorResult.rows.length === 0) {
        return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
      }

      const tutor = tutorResult.rows[0];
      const enrolledCount = parseInt(tutor.enrolled_count) || 0;

      if (enrolledCount >= tutor.max_students) {
        // Add to waitlist if user is authenticated
        if (user) {
          await query(
            `INSERT INTO tutor_students (tutor_id, user_id, student_name, status)
             VALUES ($1, $2, $3, 'waitlist')
             ON CONFLICT (tutor_id, user_id) DO NOTHING`,
            [id, user.id, student]
          );
        }
        return NextResponse.json({ message: "Session is full. Added to waitlist." }, { status: 409 });
      }

      // Add student
      if (user) {
        await query(
          `INSERT INTO tutor_students (tutor_id, user_id, student_name, status)
           VALUES ($1, $2, $3, 'registered')
           ON CONFLICT (tutor_id, user_id) DO UPDATE SET student_name = $3`,
          [id, user.id, student]
        );
      } else {
        // For unauthenticated users, still allow but don't track in DB
        // This maintains backward compatibility
      }

      return NextResponse.json({
        message: "You have reserved a seat with this tutor",
        student,
        tutorId: id,
      });
    } catch (dbError) {
      console.error("Database error, falling back to mock data:", dbError);
      // Fallback to mock data function
      const result = joinTutorSession(id);
      if (!result.success) {
        if (result.status === "not_found") {
          return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
        }
        if (result.status === "full") {
          return NextResponse.json({ message: "Session is full. Added to waitlist." }, { status: 409 });
        }
      }
      return NextResponse.json({
        message: "You have reserved a seat with this tutor",
        student,
        tutorId: id,
      });
    }
  } catch (error) {
    console.error("Error joining tutor session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


