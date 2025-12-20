import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import { getUserById } from "@/lib/auth";

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        m.*,
        u.name as seller
      FROM marketplace_listings m
      LEFT JOIN users u ON m.created_by = u.id
      ORDER BY m.created_at DESC
    `);
    
    const listings = result.rows.map(row => ({
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
      sellerName: row.seller_name, // Original seller name from form
      sellerYear: row.seller_year,
      createdBy: row.created_by,
      seller: row.seller, // Name from user table
      createdAt: row.created_at,
    }));

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    const dbUser = await getUserById(authUser.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      type,
      course,
      price,
      condition,
      location,
      deliveryOptions,
      description,
      highlights,
      contactEmail,
      sellerYear,
      previewPages,
    } = body;

    const result = await query(
      `INSERT INTO marketplace_listings (
        title, type, course, price, condition, location, 
        delivery_options, description, highlights, contact_email, 
        seller_name, seller_year, preview_pages, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        title,
        type,
        course || "",
        price,
        condition || "Gently used",
        location || "Campus",
        deliveryOptions || ["Meet on campus"],
        description,
        highlights || [],
        contactEmail,
        dbUser.name,
        sellerYear || "Student",
        previewPages || 0,
        authUser.id
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating marketplace listing:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
