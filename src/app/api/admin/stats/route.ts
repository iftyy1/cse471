import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const usersCount = await query('SELECT COUNT(*) FROM users');
    const postsCount = await query('SELECT COUNT(*) FROM posts');
    const jobsCount = await query('SELECT COUNT(*) FROM jobs');
    const marketCount = await query('SELECT COUNT(*) FROM marketplace_listings');
    const tutorsCount = await query('SELECT COUNT(*) FROM tutors');
    const projectsCount = await query('SELECT COUNT(*) FROM projects');
    const tournamentsCount = await query('SELECT COUNT(*) FROM tournaments');
    const lostFoundCount = await query('SELECT COUNT(*) FROM lost_found_items');

    return NextResponse.json({
      users: parseInt(usersCount.rows[0].count),
      posts: parseInt(postsCount.rows[0].count),
      jobs: parseInt(jobsCount.rows[0].count),
      market: parseInt(marketCount.rows[0].count),
      tutors: parseInt(tutorsCount.rows[0].count),
      projects: parseInt(projectsCount.rows[0].count),
      tournaments: parseInt(tournamentsCount.rows[0].count),
      lostFound: parseInt(lostFoundCount.rows[0].count),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
