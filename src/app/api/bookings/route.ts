import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutor_id');
    const studentId = searchParams.get('student_id');

    let queryStr = `
      SELECT b.*, 
             t.name as tutor_name, 
             u.name as student_real_name,
             u.email as student_email
      FROM bookings b
      LEFT JOIN tutors t ON b.tutor_id = t.id
      LEFT JOIN users u ON b.student_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (tutorId) {
      params.push(tutorId);
      queryStr += ` AND b.tutor_id = $${params.length}`;
    }

    if (studentId) {
      params.push(studentId);
      queryStr += ` AND b.student_id = $${params.length}`;
    }

    // If user is not admin, strict filtering
    if (user) {
        if (user.role !== 'admin') {
            // Users can see bookings if they are:
            // 1. The student (student_id matches user.id)
            // 2. The tutor who owns the tutor profile (created_by matches user.id)
            
            if (studentId && parseInt(studentId) !== user.id) {
                 return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }
            
            // If filtering by tutor_id, verify the user owns that tutor profile
            if (tutorId) {
                const tutorCheck = await query(
                    `SELECT created_by FROM tutors WHERE id = $1`,
                    [tutorId]
                );
                if (tutorCheck.rows.length === 0 || tutorCheck.rows[0].created_by !== user.id) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
                }
            }
        }
    }

    queryStr += ` ORDER BY b.created_at DESC`;

    const res = await query(queryStr, params);
    return NextResponse.json(res.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not list bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const body = await request.json();
    const tutorId = Number(body.tutorId);
    const startTime = typeof body.startTime === "string" ? body.startTime : null;
    const durationMinutes = Number(body.durationMinutes) || 60;
    
    // Fallback name if not logged in (though we should require login)
    let studentName = typeof body.studentName === "string" ? body.studentName.trim() : "Guest";
    let studentId = null;

    if (user) {
        studentName = user.name;
        studentId = user.id;
    }

    if (!tutorId) {
      return NextResponse.json({ error: "tutorId is required" }, { status: 400 });
    }

    // Get Tutor from DB
    const tutorRes = await query(`SELECT * FROM tutors WHERE id = $1`, [tutorId]);
    if (tutorRes.rows.length === 0) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }
    const tutor = tutorRes.rows[0];

    const hourlyRate = parseFloat(tutor.hourly_rate) || 0;
    const hours = Math.max(0.25, Math.ceil(durationMinutes) / 60);
    const total = Math.round(hours * hourlyRate * 100) / 100;

    const insert = await query(
      `INSERT INTO bookings (
        tutor_id, student_id, student_name, start_time, duration_minutes, hourly_rate, total, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') 
       RETURNING *`,
      [tutorId, studentId, studentName, startTime, durationMinutes, hourlyRate, total]
    );

    return NextResponse.json(insert.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid request or DB error" }, { status: 500 });
  }
}
