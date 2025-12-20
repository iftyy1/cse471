import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const result = await query(
      `SELECT 
        m.*,
        u.name as seller
      FROM marketplace_listings m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const row = result.rows[0];
    const listing = {
      id: row.id,
      title: row.title,
      type: row.type,
      course: row.course,
      price: parseFloat(row.price),
      condition: row.condition,
      location: row.location,
      deliveryOptions: row.delivery_options,
      description: row.description,
      highlights: row.highlights,
      contactEmail: row.contact_email,
      previewPages: row.preview_pages,
      sellerName: row.seller_name,
      sellerYear: row.seller_year,
      createdBy: row.created_by,
      seller: row.seller,
      createdAt: row.created_at,
    };

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const id = Number(params.id);

    // Check ownership or admin
    const check = await query('SELECT created_by FROM marketplace_listings WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (check.rows[0].created_by !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await query('DELETE FROM marketplace_listings WHERE id = $1', [id]);
    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


