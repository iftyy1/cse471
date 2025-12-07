import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import { marketplaceListings } from "@/lib/data";

export async function GET() {
  try {
    // Try to get from database first
    const result = await query(
      `SELECT * FROM marketplace_listings ORDER BY created_at DESC`
    );

    if (result.rows.length > 0) {
      const listings = result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        type: row.type,
        course: row.course,
        price: parseFloat(row.price),
        condition: row.condition,
        location: row.location,
        deliveryOptions: row.delivery_options || [],
        description: row.description,
        highlights: row.highlights || [],
        contactEmail: row.contact_email,
        previewPages: row.preview_pages || 0,
        seller: row.seller_name,
        sellerYear: row.seller_year,
        postedAt: row.created_at,
      }));
      return NextResponse.json(listings);
    }

    // Fallback to mock data if database is empty
    return NextResponse.json(marketplaceListings);
  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
    // Fallback to mock data on error
    return NextResponse.json(marketplaceListings);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);

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
      previewPages,
      sellerName,
      sellerYear,
    } = body;

    if (!title || !type || !course || !price || !condition || !location || !description || !contactEmail || !sellerName || !sellerYear) {
      return NextResponse.json(
        { error: "Title, type, course, price, condition, location, description, contactEmail, sellerName, and sellerYear are required" },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO marketplace_listings (
        title, type, course, price, condition, location, delivery_options,
        description, highlights, contact_email, preview_pages, seller_name, seller_year, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        title,
        type,
        course,
        price,
        condition,
        location,
        deliveryOptions || [],
        description,
        highlights || [],
        contactEmail,
        previewPages || 0,
        sellerName,
        sellerYear,
        user.id,
      ]
    );

    const listing = result.rows[0];
    return NextResponse.json({
      id: listing.id,
      title: listing.title,
      type: listing.type,
      course: listing.course,
      price: parseFloat(listing.price),
      condition: listing.condition,
      location: listing.location,
      deliveryOptions: listing.delivery_options || [],
      description: listing.description,
      highlights: listing.highlights || [],
      contactEmail: listing.contact_email,
      previewPages: listing.preview_pages || 0,
      seller: listing.seller_name,
      sellerYear: listing.seller_year,
      postedAt: listing.created_at,
    }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error creating marketplace listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


