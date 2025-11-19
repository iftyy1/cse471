import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/db-init";

// This endpoint can be called to manually initialize the database
export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to initialize database" },
      { status: 500 }
    );
  }
}

