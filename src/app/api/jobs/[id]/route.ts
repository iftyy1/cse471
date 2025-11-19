import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";

// GET job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = parseInt(params.id);

    if (isNaN(jobId)) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        j.*,
        u.name as posted_by_name,
        u.email as posted_by_email,
        COUNT(DISTINCT a.id) as application_count
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.id = $1
      GROUP BY j.id, u.name, u.email`,
      [jobId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update job
export async function PUT(
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
        { error: "Unauthorized to update this job" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      company,
      location,
      type,
      description,
      requirements,
      salary_min,
      salary_max,
      application_deadline,
    } = body;

    const result = await query(
      `UPDATE jobs SET
        title = COALESCE($1, title),
        company = COALESCE($2, company),
        location = COALESCE($3, location),
        type = COALESCE($4, type),
        description = COALESCE($5, description),
        requirements = COALESCE($6, requirements),
        salary_min = COALESCE($7, salary_min),
        salary_max = COALESCE($8, salary_max),
        application_deadline = COALESCE($9, application_deadline),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *`,
      [
        title,
        company,
        location,
        type,
        description,
        requirements,
        salary_min,
        salary_max,
        application_deadline,
        jobId,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE job
export async function DELETE(
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
        { error: "Unauthorized to delete this job" },
        { status: 403 }
      );
    }

    await query('DELETE FROM jobs WHERE id = $1', [jobId]);

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

