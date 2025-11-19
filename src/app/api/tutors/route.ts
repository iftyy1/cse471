import { NextResponse } from "next/server";
import { tutorsData } from "@/lib/data";

export async function GET() {
  return NextResponse.json(tutorsData);
}


