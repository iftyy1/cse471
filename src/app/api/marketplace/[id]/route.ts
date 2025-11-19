import { NextRequest, NextResponse } from "next/server";
import { marketplaceListings } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const listing = marketplaceListings.find((item) => item.id === id);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json(listing);
}


