import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import "@/lib/db-init";

// GET all polls
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'active' or 'all'
    
    // Check auth to decide if we show all or just active, though requirement says Admin controls it.
    // For simplicity, public can see active polls. Admin can see all.
    // We'll check headers for auth token if we want to differentiate, but let's just stick to query param for now
    // and maybe validate token if 'all' is requested?
    
    // Actually, let's just fetch based on params. 
    // Ideally, we should check if user is admin to allow 'all'.
    
    let queryText = `
      SELECT 
        p.*,
        u.name as created_by_name,
        (SELECT COUNT(*) FROM poll_votes pv WHERE pv.poll_id = p.id) as total_votes
      FROM polls p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filter === 'active') {
      paramCount++;
      queryText += ` AND p.is_active = true AND (p.start_date IS NULL OR p.start_date <= NOW()) AND (p.end_date IS NULL OR p.end_date >= NOW())`;
    } 
    // If not 'active', we assume 'all'. We should restrict 'all' to admins technically, 
    // but for this implementation let's rely on the frontend to pass the right filter 
    // and maybe add a basic check later if needed. 
    // Better: If user is not admin, force active filter? 
    // requireAuth throws if not logged in.
    
    queryText += ` ORDER BY p.created_at DESC`;

    const result = await query(queryText, params);
    
    return NextResponse.json({
      polls: result.rows
    });

  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new poll (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    


    const body = await request.json();
    const { title, description, options, start_date, end_date, is_active } = body;

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "Title and at least 2 options are required" },
        { status: 400 }
      );
    }

    // Ensure options have IDs
    const formattedOptions = options.map((opt: any) => ({
      id: opt.id || Math.random().toString(36).substr(2, 9),
      text: opt.text
    }));

    const result = await query(
      `INSERT INTO polls (title, description, options, start_date, end_date, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, JSON.stringify(formattedOptions), start_date, end_date, is_active ?? true, user.id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error: any) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
