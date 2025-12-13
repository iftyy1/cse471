import { NextRequest, NextResponse } from "next/server";
import { tutorsData } from "@/lib/data";
import { query } from "@/lib/db";

async function ensureBookingsTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      tutor_id INTEGER NOT NULL,
      student_name TEXT,
      start_time TIMESTAMPTZ,
      duration_minutes INTEGER,
      hourly_rate NUMERIC(10,2),
      total NUMERIC(10,2),
      status TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );`
  );
}

export async function GET() {
  try {
    await ensureBookingsTable();
    const res = await query(`SELECT * FROM bookings ORDER BY created_at DESC`);
    return NextResponse.json(res.rows);
  } catch (err) {
    return NextResponse.json({ error: "Could not list bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureBookingsTable();
    const body = await request.json();
    const tutorId = Number(body.tutorId);
    const studentName = typeof body.studentName === "string" ? body.studentName.trim() : "";
    const startTime = typeof body.startTime === "string" ? body.startTime : null;
    const durationMinutes = Number(body.durationMinutes) || 60;

    if (!tutorId) {
      return NextResponse.json({ error: "tutorId is required" }, { status: 400 });
    }

    const tutor = tutorsData.find((t) => t.id === tutorId);
    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    const hourlyRate = tutor.hourlyRate || 0;
    const hours = Math.max(0.25, Math.ceil(durationMinutes) / 60);
    const total = Math.round(hours * hourlyRate * 100) / 100;

    const insert = await query(
      `INSERT INTO bookings (tutor_id, student_name, start_time, duration_minutes, hourly_rate, total, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [tutorId, studentName, startTime, durationMinutes, hourlyRate, total, "pending"]
    );

    return NextResponse.json(insert.rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid request or DB error" }, { status: 500 });
  }
}
