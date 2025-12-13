import { Buffer } from "buffer";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import {
  DASHBOARD_SUPPORTED_ROLES,
  DashboardRole,
  getRoleActivityFeed,
} from "@/lib/data";

function decodeCursor(cursor: string | null) {
  if (!cursor) {
    return 0;
  }

  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
    return typeof decoded.offset === "number" && decoded.offset >= 0
      ? decoded.offset
      : 0;
  } catch {
    return 0;
  }
}

function encodeCursor(offset: number) {
  return Buffer.from(JSON.stringify({ offset })).toString("base64");
}

export async function GET(
  request: NextRequest,
  { params }: { params: { role: string } }
) {
  try {
    const authUser = requireAuth(request);
    const requestedRole = params.role as DashboardRole;

    if (!DASHBOARD_SUPPORTED_ROLES.includes(requestedRole)) {
      return NextResponse.json(
        { error: "Unsupported role" },
        { status: 404 }
      );
    }

    if (authUser.role !== requestedRole && authUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get("limit") || 10);
    const limit = Number.isNaN(limitParam)
      ? 10
      : Math.min(Math.max(limitParam, 1), 25);
    const cursorParam = searchParams.get("cursor");
    const filtersParam = searchParams.get("filters");
    const filters =
      filtersParam
        ?.split(",")
        .map((filter) => filter.trim().toLowerCase())
        .filter(Boolean) || [];

    const allActivity = getRoleActivityFeed(requestedRole);
    const filteredActivity =
      filters.length > 0
        ? allActivity.filter((activity) =>
            activity.tags?.some((tag) => filters.includes(tag.toLowerCase()))
          )
        : allActivity;

    const startOffset = decodeCursor(cursorParam);
    const activitySlice = filteredActivity.slice(
      startOffset,
      startOffset + limit
    );
    const nextOffset = startOffset + limit;
    const nextCursor =
      nextOffset < filteredActivity.length ? encodeCursor(nextOffset) : null;

    return NextResponse.json({
      role: requestedRole,
      activity: activitySlice,
      nextCursor,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error retrieving dashboard activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

