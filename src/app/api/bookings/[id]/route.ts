import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthUser } from "@/middleware/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(params.id);
    const body = await request.json();
    const { status, meetLink } = body;

    // Verify ownership
    // The user must be the tutor (creator of the tutor profile) for this booking.
    const bookingRes = await query(`
      SELECT b.*, t.created_by as tutor_user_id
      FROM bookings b
      JOIN tutors t ON b.tutor_id = t.id
      WHERE b.id = $1
    `, [id]);

    if (bookingRes.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingRes.rows[0];

    // Only the tutor (tutor_user_id) can accept/reject or add link
    // Only the student can cancel? (Maybe later)
    if (booking.tutor_user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updates = [];
    const values = [];
    let queryStr = "UPDATE bookings SET ";

    if (status) {
      values.push(status);
      updates.push(`status = $${values.length}`);
    }

    if (meetLink !== undefined) {
      values.push(meetLink);
      updates.push(`meet_link = $${values.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json(booking);
    }

    values.push(id);
    queryStr += updates.join(", ") + ` WHERE id = $${values.length} RETURNING *`;

    const result = await query(queryStr, values);
    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
