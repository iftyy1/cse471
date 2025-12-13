import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { tutorsData } from "@/lib/data";

export async function GET() {
  try {
    // Try to get from database first
    const result = await query(
      `SELECT t.*, 
       COUNT(ts.id) as joined_students
       FROM tutors t
       LEFT JOIN tutor_students ts ON t.id = ts.tutor_id AND ts.status = 'registered'
       GROUP BY t.id
       ORDER BY t.created_at DESC`
    );

    if (result.rows.length > 0) {
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
    }

    // Fallback to mock data if database is empty
    return NextResponse.json(tutorsData);
  } catch (error) {
    console.error("Error fetching tutors:", error);
    // Fallback to mock data on error
    return NextResponse.json(tutorsData);
  }
}


