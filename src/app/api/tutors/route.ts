import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { tutorsData } from "@/lib/data";
import { requireAuth } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let queryStr = `SELECT t.*, 
       COUNT(ts.id) as joined_students
       FROM tutors t
       LEFT JOIN tutor_students ts ON t.id = ts.tutor_id AND ts.status = 'registered'
    `;
    const params = [];

    if (userId) {
      params.push(userId);
      queryStr += ` WHERE t.created_by = $${params.length}`;
    }

    queryStr += ` GROUP BY t.id ORDER BY t.created_at DESC`;

    // Try to get from database first
    const result = await query(queryStr, params);

    const tutors = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      subjects: row.subjects || [],
      hourlyRate: row.hourly_rate,
      year: row.year,
      headline: row.headline,
      description: row.description,
      mode: row.mode,
      availability: row.availability,
      achievements: row.achievements || [],
      contactEmail: row.contact_email,
      sessionsHosted: row.sessions_hosted || 0,
      rating: parseFloat(row.rating) || 0,
      joinedStudents: parseInt(row.joined_students) || 0,
      maxStudents: row.max_students,
      createdBy: row.created_by,
      createdAt: row.created_at,
    }));
    return NextResponse.json(tutors);
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    
    // Only student_tutor or admin can post? Or anyone?
    // Let's assume anyone who wants to be a tutor.
    // But usually role check is good. The registration allows "student_tutor" role.
    
    // Check if user is already a tutor?
    // For now, let's just allow creating a tutor profile.

    const body = await request.json();
    const {
      name,
      subjects,
      hourlyRate,
      year,
      headline,
      description,
      mode,
      availability,
      achievements,
      contactEmail,
      maxStudents
    } = body;

    const result = await query(
      `INSERT INTO tutors (
        name, subjects, hourly_rate, year, headline, description, 
        mode, availability, achievements, contact_email, max_students, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        name,
        subjects,
        hourlyRate,
        year,
        headline,
        description,
        mode,
        availability,
        achievements,
        contactEmail,
        maxStudents || 5,
        user.id
      ]
    );

    // Update user role to student_tutor if not admin
    if (user.role !== 'admin' && user.role !== 'student_tutor') {
        await query(`UPDATE users SET role = 'student_tutor' WHERE id = $1`, [user.id]);
    }

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating tutor:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


