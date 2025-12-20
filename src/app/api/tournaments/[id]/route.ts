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
       COUNT(tp.id) as enrolled_participants,
       u.name as created_by_name
       FROM tournaments t
       LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1
       GROUP BY t.id, u.name`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const row = result.rows[0];
    const tournament = {
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
    };

    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error fetching tournament:", error);
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

    const check = await query('SELECT created_by FROM tournaments WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (check.rows[0].created_by !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await query('DELETE FROM tournaments WHERE id = $1', [id]);
    return NextResponse.json({ message: "Tournament deleted successfully" });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
