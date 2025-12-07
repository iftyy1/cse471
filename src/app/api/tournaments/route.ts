import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import { tournamentsData } from "@/lib/data";

export async function GET() {
  try {
    // Try to get from database first
    const result = await query(
      `SELECT t.*, 
       COUNT(tp.id) as enrolled_participants,
       u.name as created_by_name
       FROM tournaments t
       LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
       LEFT JOIN users u ON t.created_by = u.id
       GROUP BY t.id, u.name
       ORDER BY t.created_at DESC`
    );

    if (result.rows.length > 0) {
      const tournaments = result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        organizer: row.organizer,
        category: row.category,
        location: row.location,
        dateRange: row.date_range,
        registrationDeadline: row.registration_deadline,
        prizePool: row.prize_pool,
        maxParticipants: row.max_participants,
        enrolledParticipants: parseInt(row.enrolled_participants) || 0,
        description: row.description,
        rules: row.rules || [],
        tags: row.tags || [],
        status: row.status,
        createdBy: row.created_by,
        createdAt: row.created_at,
      }));
      return NextResponse.json(tournaments);
    }

    // Fallback to mock data if database is empty
    return NextResponse.json(tournamentsData);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    // Fallback to mock data on error
    return NextResponse.json(tournamentsData);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const body = await request.json();
    const {
      title,
      organizer,
      category,
      location,
      dateRange,
      registrationDeadline,
      prizePool,
      maxParticipants,
      description,
      rules,
      tags,
      status,
    } = body;

    if (!title || !organizer || !category || !location || !dateRange || !registrationDeadline || !prizePool || !maxParticipants || !description) {
      return NextResponse.json(
        { error: "Title, organizer, category, location, dateRange, registrationDeadline, prizePool, maxParticipants, and description are required" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO tournaments (
        title, organizer, category, location, date_range, registration_deadline,
        prize_pool, max_participants, description, rules, tags, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        title,
        organizer,
        category,
        location,
        dateRange,
        registrationDeadline,
        prizePool,
        maxParticipants,
        description,
        rules || [],
        tags || [],
        status || "Upcoming",
        user.id,
      ]
    );

    return NextResponse.json({ ...result.rows[0], enrolledParticipants: 0 }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error creating tournament:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


