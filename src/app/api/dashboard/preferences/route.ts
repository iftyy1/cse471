import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import {
  DASHBOARD_SUPPORTED_ROLES,
  DASHBOARD_TAB_KEYS,
  DASHBOARD_WIDGET_KEYS,
  DashboardRole,
  DashboardPreferencesInput,
  getDashboardPreferencesForUser,
  saveDashboardPreferencesForUser,
} from "@/lib/data";

export const dynamic = 'force-dynamic';

function isValidWidgetOrder(order: unknown): order is string[] {
  return (
    Array.isArray(order) &&
    order.every((item) =>
      DASHBOARD_WIDGET_KEYS.includes(item as (typeof DASHBOARD_WIDGET_KEYS)[number])
    )
  );
}

export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const roleParam = (searchParams.get("role") || authUser.role) as DashboardRole;

    if (
      roleParam !== authUser.role &&
      authUser.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!DASHBOARD_SUPPORTED_ROLES.includes(roleParam)) {
      return NextResponse.json({ error: "Unsupported role" }, { status: 404 });
    }

    const preferences = getDashboardPreferencesForUser(authUser.id, roleParam);
    return NextResponse.json({ preferences });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching dashboard preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    const body = (await request.json()) as DashboardPreferencesInput & {
      role?: DashboardRole;
      defaultTab?: string;
      widgetOrder?: string[];
    };

    const role = body.role || (authUser.role as DashboardRole);

    if (!DASHBOARD_SUPPORTED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Unsupported role" }, { status: 404 });
    }

    if (role !== authUser.role && authUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body.defaultTab && !DASHBOARD_TAB_KEYS.includes(body.defaultTab as (typeof DASHBOARD_TAB_KEYS)[number])) {
      return NextResponse.json(
        { error: `defaultTab must be one of: ${DASHBOARD_TAB_KEYS.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.widgetOrder && !isValidWidgetOrder(body.widgetOrder)) {
      return NextResponse.json(
        { error: `widgetOrder items must be among: ${DASHBOARD_WIDGET_KEYS.join(", ")}` },
        { status: 400 }
      );
    }

    const preferences = saveDashboardPreferencesForUser(authUser.id, role, {
      defaultTab: body.defaultTab,
      widgetOrder: body.widgetOrder,
      notificationsMuted: body.notificationsMuted,
    });

    return NextResponse.json({
      message: "Dashboard preferences saved",
      preferences,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error saving dashboard preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

