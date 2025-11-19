import { NextResponse } from "next/server";
import { tournamentsData } from "@/lib/data";

export async function GET() {
  return NextResponse.json(tournamentsData);
}


