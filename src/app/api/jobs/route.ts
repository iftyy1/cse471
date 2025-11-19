import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import "@/lib/db-init"; // Initialize database on first API call

// GET all jobs with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT 
        j.*,
        u.name as posted_by_name,
        COUNT(a.id) as application_count
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      queryText += ` AND j.type = $${paramCount}`;
      params.push(type);
    }

    if (location) {
      paramCount++;
      queryText += ` AND j.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    if (search) {
      paramCount++;
      queryText += ` AND (j.title ILIKE $${paramCount} OR j.company ILIKE $${paramCount} OR j.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    queryText += ` GROUP BY j.id, u.name ORDER BY j.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM jobs WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 0;

    if (type) {
      countParamCount++;
      countQuery += ` AND type = $${countParamCount}`;
      countParams.push(type);
    }
    if (location) {
      countParamCount++;
      countQuery += ` AND location ILIKE $${countParamCount}`;
      countParams.push(`%${location}%`);
    }
    if (search) {
      countParamCount++;
      countQuery += ` AND (title ILIKE $${countParamCount} OR company ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      jobs: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new job
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);

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

    if (!title || !company || !location || !type || !description || !requirements) {
      return NextResponse.json(
        { error: "Title, company, location, type, description, and requirements are required" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO jobs (
        title, company, location, type, description, requirements,
        salary_min, salary_max, application_deadline, posted_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        title,
        company,
        location,
        type,
        description,
        requirements,
        salary_min || null,
        salary_max || null,
        application_deadline || null,
        user.id,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

