import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import "@/lib/db-init";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request);
    const pollId = params.id;
    const { optionId } = await request.json();

    if (!optionId) {
      return NextResponse.json({ error: "Option ID is required" }, { status: 400 });
    }

    // Check if poll exists and is active
    const pollResult = await query(
      `SELECT * FROM polls WHERE id = $1`,
      [pollId]
    );

    if (pollResult.rows.length === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const poll = pollResult.rows[0];

    if (!poll.is_active) {
      return NextResponse.json({ error: "Poll is not active" }, { status: 400 });
    }

    const now = new Date();
    if (poll.start_date && new Date(poll.start_date) > now) {
      return NextResponse.json({ error: "Poll has not started yet" }, { status: 400 });
    }
    if (poll.end_date && new Date(poll.end_date) < now) {
      return NextResponse.json({ error: "Poll has ended" }, { status: 400 });
    }

    // Check if option is valid
    const options = poll.options; // JSONB
    const isValidOption = options.some((opt: any) => opt.id === optionId);
    if (!isValidOption) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }

    // Check if user already voted
    const voteCheck = await query(
      `SELECT id FROM poll_votes WHERE poll_id = $1 AND user_id = $2`,
      [pollId, user.id]
    );

    if (voteCheck.rows.length > 0) {
      // Maybe allow changing vote?
      // For now, update vote
      await query(
        `UPDATE poll_votes SET option_id = $1, created_at = NOW() WHERE poll_id = $2 AND user_id = $3`,
        [optionId, pollId, user.id]
      );
      return NextResponse.json({ message: "Vote updated" });
    } else {
      // Insert vote
      await query(
        `INSERT INTO poll_votes (poll_id, user_id, option_id) VALUES ($1, $2, $3)`,
        [pollId, user.id, optionId]
      );
      return NextResponse.json({ message: "Vote recorded" });
    }

  } catch (error: any) {
    console.error("Error voting:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
