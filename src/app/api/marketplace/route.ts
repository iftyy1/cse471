import { NextRequest, NextResponse } from "next/server";
import { getNextMarketplaceListingId, marketplaceListings } from "@/lib/data";
import { requireAuth } from "@/middleware/auth";
import { getUserById } from "@/lib/auth";

export async function GET() {
  return NextResponse.json(marketplaceListings);
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
      images,
      sellerYear,
      previewPages,
    } = body;

    const requiredFields = { title, type, price, description, contactEmail };
    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      );
    }

    if (images && (!Array.isArray(images) || images.length > 6)) {
      return NextResponse.json(
        { error: "You can provide up to 6 image URLs" },
        { status: 413 }
      );
    }

    const normalizedDeliveryOptions =
      Array.isArray(deliveryOptions) && deliveryOptions.length > 0
        ? deliveryOptions.map((option: unknown) => String(option))
        : ["Meet on campus"];

    const normalizedHighlights = Array.isArray(highlights)
      ? highlights.map((highlight: unknown) => String(highlight)).slice(0, 6)
      : undefined;

    const normalizedImages = Array.isArray(images)
      ? images.map((image: unknown) => String(image)).slice(0, 6)
      : undefined;

    const newListing = {
      id: getNextMarketplaceListingId(),
      sellerId: dbUser.id,
      seller: dbUser.name,
      sellerYear: sellerYear || "Student Vendor",
      title: String(title),
      type: String(type),
      course: course ? String(course) : undefined,
      price,
      condition: condition ? String(condition) : "Gently used",
      location: location ? String(location) : "Campus",
      deliveryOptions: normalizedDeliveryOptions,
      description: String(description),
      highlights: normalizedHighlights,
      contactEmail: String(contactEmail),
      previewPages:
        typeof previewPages === "number" && previewPages >= 0 ? previewPages : undefined,
      postedAt: new Date().toISOString(),
      status: "active" as const,
      images: normalizedImages,
    };

    marketplaceListings.push(newListing);

    return NextResponse.json(
      {
        id: newListing.id,
        title: newListing.title,
        type: newListing.type,
        price: newListing.price,
        status: newListing.status,
        sellerId: newListing.sellerId,
        createdAt: newListing.postedAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error creating marketplace listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
