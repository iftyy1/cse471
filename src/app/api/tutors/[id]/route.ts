import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const result = await query(
      `SELECT t.*, 
       COUNT(ts.id) as joined_students
       FROM tutors t
       LEFT JOIN tutor_students ts ON t.id = ts.tutor_id AND ts.status = 'registered'
       WHERE t.id = $1
       GROUP BY t.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    const row = result.rows[0];
    const tutor = {
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
    };

    return NextResponse.json(tutor);
  } catch (error) {
    console.error("Error fetching tutor:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const id = Number(params.id);

    // Check ownership or admin
    const check = await query('SELECT created_by FROM tutors WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    if (check.rows[0].created_by !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await query('DELETE FROM tutors WHERE id = $1', [id]);
    return NextResponse.json({ message: "Tutor deleted successfully" });
  } catch (error) {
    console.error("Error deleting tutor:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


