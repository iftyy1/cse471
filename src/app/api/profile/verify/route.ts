import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";

// This is a mock verification endpoint
// In a real application, this would interact with the SheerID API
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);

    // Simulate API call to SheerID
    // In production: const sheerIdResponse = await fetch('https://services.sheerid.com/verify/...')
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock successful verification
    const verificationId = `sheerid_${Math.random().toString(36).substring(2, 15)}`;

    // Update user status in database
    await query(
      `UPDATE users SET is_verified = TRUE, sheerid_verification_id = $1 WHERE id = $2`,
      [verificationId, user.id]
    );

    return NextResponse.json({ 
      success: true, 
      message: "Student verification successful",
      verificationId 
    });

  } catch (error: any) {
     if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Error verifying student status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
