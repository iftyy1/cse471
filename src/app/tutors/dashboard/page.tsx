"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Booking {
  id: number;
  student_name: string;
  student_id: number;
  student_email?: string;
  start_time: string;
  duration_minutes: number;
  total: number;
  status: string;
  meet_link?: string;
  created_at: string;
}

interface Tutor {
  id: number;
  name: string;
  subjects: string[];
}

export default function TutorDashboard() {
  const router = useRouter();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [meetLink, setMeetLink] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (!userStr || !token) {
        router.push("/login");
        return;
      }
      
      const user = JSON.parse(userStr);

      // 1. Get my tutor profiles
      const tutorRes = await fetch(`/api/tutors?user_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (tutorRes.ok) {
        const tutorsData = await tutorRes.json();
        // Filter out mock data if returned (mock data has createdBy undefined or specific IDs usually)
        // But our API returns array. If empty or mock data, we need to be careful.
        // The API fallback returns mock data which might not have created_by set to our user.
        // But we filtered by user_id in the query.
        // If the API returned mock data because no DB rows matched, we should ignore it if it doesn't match our ID.
        // Actually the API logic is: if result.rows > 0 return DB rows. Else return Mock.
        // So if we have no tutor profile, we might get mock data.
        // We should check createdBy.
        
        const myTutors = Array.isArray(tutorsData) ? tutorsData.filter((t: any) => t.createdBy === user.id) : [];
        setTutors(myTutors);

        if (myTutors.length > 0) {
          // 2. Get bookings for my first tutor profile (supporting multiple in future)
          const tutorId = myTutors[0].id;
          const bookingsRes = await fetch(`/api/bookings?tutor_id=${tutorId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (bookingsRes.ok) {
            setBookings(await bookingsRes.json());
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (booking: Booking) => {
    setSelectedBooking(booking);
    setMeetLink(booking.meet_link || "");
    setModalOpen(true);
  };

  const confirmAccept = async () => {
    if (!selectedBooking) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "accepted",
          meetLink: meetLink
        })
      });

      if (res.ok) {
        setModalOpen(false);
        fetchData(); // Refresh
      } else {
        alert("Failed to update booking");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this booking?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "rejected" })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (tutors.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Tutor Dashboard</h1>
        <p className="mb-6 text-gray-600">You haven't created a tutor profile yet.</p>
        <button 
          onClick={() => router.push("/tutors/create")} // Assuming this exists or will be created? Or just /tutors and a "Become a Tutor" button?
          // Actually /tutors usually has a "Become a Tutor" button that opens a modal or form.
          // Let's redirect to /tutors for now.
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
        >
          Become a Tutor
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Tutor Dashboard</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Requests</h2>
        </div>
        
        {bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No bookings yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      <div>{booking.student_name}</div>
                      <div className="text-xs text-gray-500">{booking.student_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {booking.start_time ? new Date(booking.start_time).toLocaleString() : 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{booking.duration_minutes} min</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">${booking.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${booking.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {booking.status}
                      </span>
                      {booking.meet_link && (
                        <div className="text-xs text-blue-500 mt-1 max-w-[150px] truncate">
                            <a href={booking.meet_link} target="_blank" rel="noopener noreferrer">Link</a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAccept(booking)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleReject(booking.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {booking.status === 'accepted' && (
                        <button 
                          onClick={() => handleAccept(booking)} // Re-open modal to edit link
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit Link
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Accept Booking</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Please provide the meeting link for the session (e.g., Google Meet, Zoom).
            </p>
            <input
              type="text"
              placeholder="https://meet.google.com/..."
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="w-full border p-2 rounded mb-4 text-gray-900 dark:text-white bg-transparent dark:border-gray-600"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAccept}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {updating ? "Saving..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
