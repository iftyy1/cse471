import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth, getAuthUser } from "@/middleware/auth";
import "@/lib/db-init";

// GET poll details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pollId = params.id;
    const user = getAuthUser(request);

    // Get poll data
    const pollResult = await query(
      `SELECT p.*, u.name as created_by_name 
       FROM polls p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.id = $1`,
      [pollId]
    );

    if (pollResult.rows.length === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const poll = pollResult.rows[0];

    // Get vote counts
    const votesResult = await query(
      `SELECT option_id, COUNT(*) as count 
       FROM poll_votes 
       WHERE poll_id = $1 
       GROUP BY option_id`,
      [pollId]
    );

    // Map counts to options
    const voteCounts: Record<string, number> = {};
    votesResult.rows.forEach((row: any) => {
      voteCounts[row.option_id] = parseInt(row.count);
    });

    // Check if current user voted
    let userVote = null;
    if (user) {
      const userVoteResult = await query(
        `SELECT option_id FROM poll_votes WHERE poll_id = $1 AND user_id = $2`,
        [pollId, user.id]
      );
      if (userVoteResult.rows.length > 0) {
        userVote = userVoteResult.rows[0].option_id;
      }
    }

    return NextResponse.json({
      poll,
      results: voteCounts,
      userVote
    });

  } catch (error) {
    console.error("Error fetching poll:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update poll (Admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const pollId = params.id;
    const body = await request.json();
    const { title, description, options, start_date, end_date, is_active } = body;

    // Ensure options have IDs (preserve existing ones, generate for new ones)
    const formattedOptions = options.map((opt: any) => ({
      id: opt.id || Math.random().toString(36).substr(2, 9),
      text: opt.text
    }));

    // We allow updating everything, but updating options might be tricky if people already voted.
    // For now, let's assume admin knows what they are doing.
    
    // If options are updated, we might need to handle existing votes if option IDs change.
    // Ideally frontend keeps IDs same for existing options.

    const result = await query(
      `UPDATE polls 
       SET title = $1, description = $2, options = $3, start_date = $4, end_date = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, description, JSON.stringify(formattedOptions), start_date, end_date, is_active, pollId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);

  } catch (error: any) {
    console.error("Error updating poll:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

// DELETE poll (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const pollId = params.id;
    const result = await query('DELETE FROM polls WHERE id = $1 RETURNING id', [pollId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Poll deleted successfully" });

  } catch (error: any) {
    console.error("Error deleting poll:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
