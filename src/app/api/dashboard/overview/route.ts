import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { getUserById } from "@/lib/auth";
import { getDashboardOverviewPayload } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    const dbUser = await getUserById(authUser.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const overview = getDashboardOverviewPayload({
      id: dbUser.id,
      name: dbUser.name,
      role: dbUser.role,
    });

    return NextResponse.json(overview);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error generating dashboard overview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

