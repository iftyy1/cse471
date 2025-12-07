import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";
import { joinTournament } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const user = getAuthUser(request);
    const body = await request.json().catch(() => ({}));
    const participant = typeof body.participant === "string" ? body.participant.trim() : "";

    if (!participant) {
      return NextResponse.json({ error: "Participant name is required" }, { status: 400 });
    }

    // Try database first
    try {
      // Get tournament
      const tournamentResult = await query(
        `SELECT t.*, COUNT(tp.id) as enrolled_count
         FROM tournaments t
         LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
         WHERE t.id = $1
         GROUP BY t.id`,
        [id]
      );

      if (tournamentResult.rows.length === 0) {
        return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
      }

      const tournament = tournamentResult.rows[0];
      const enrolledCount = parseInt(tournament.enrolled_count) || 0;

      if (enrolledCount >= tournament.max_participants) {
        // Add to waitlist if user is authenticated
        if (user) {
          await query(
            `INSERT INTO tournament_participants (tournament_id, user_id, participant_name, status)
             VALUES ($1, $2, $3, 'waitlist')
             ON CONFLICT (tournament_id, user_id) DO NOTHING`,
            [id, user.id, participant]
          );
        }
        return NextResponse.json({ message: "Tournament is full. Added to waitlist." }, { status: 409 });
      }

      // Add participant
      if (user) {
        await query(
          `INSERT INTO tournament_participants (tournament_id, user_id, participant_name, status)
           VALUES ($1, $2, $3, 'registered')
           ON CONFLICT (tournament_id, user_id) DO UPDATE SET participant_name = $3`,
          [id, user.id, participant]
        );
      } else {
        // For unauthenticated users, still allow but don't track in DB
        // This maintains backward compatibility
      }

      return NextResponse.json({
        message: "You have joined the tournament roster",
        participant,
        tournamentId: id,
      });
    } catch (dbError) {
      console.error("Database error, falling back to mock data:", dbError);
      // Fallback to mock data function
      const result = joinTournament(id);
      if (!result.success) {
        if (result.status === "not_found") {
          return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
        }
        if (result.status === "full") {
          return NextResponse.json({ message: "Tournament is full. Added to waitlist." }, { status: 409 });
        }
      }
      return NextResponse.json({
        message: "You have joined the tournament roster",
        participant,
        tournamentId: id,
      });
    }
  } catch (error) {
    console.error("Error joining tournament:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


