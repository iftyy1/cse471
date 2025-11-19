import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";

// POST apply to a job
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const jobId = parseInt(params.id);

    if (isNaN(jobId)) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      );
    }

    // Check if job exists
    const jobResult = await query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    if (jobResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await query(
      'SELECT * FROM applications WHERE job_id = $1 AND user_id = $2',
      [jobId, user.id]
    );

    if (existingApplication.rows.length > 0) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { cover_letter, resume_url } = body;

    const result = await query(
      `INSERT INTO applications (job_id, user_id, cover_letter, resume_url, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [jobId, user.id, cover_letter || null, resume_url || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error applying to job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET applications for a job (only for job poster or admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const jobId = parseInt(params.id);

    if (isNaN(jobId)) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      );
    }

    // Check if job exists and user is the owner or admin
    const jobResult = await query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    if (jobResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const job = jobResult.rows[0];
    if (job.posted_by !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized to view applications" },
        { status: 403 }
      );
    }

    const result = await query(
      `SELECT 
        a.*,
        u.name as applicant_name,
        u.email as applicant_email
      FROM applications a
      JOIN users u ON a.user_id = u.id
      WHERE a.job_id = $1
      ORDER BY a.applied_at DESC`,
      [jobId]
    );

    return NextResponse.json({ applications: result.rows });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

