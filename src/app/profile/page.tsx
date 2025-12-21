"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  posts: number;
  followers: number;
  following: number;
  role?: string;
  isVerified?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [tutorRequests, setTutorRequests] = useState<any[]>([]);
  const [myTutorProfile, setMyTutorProfile] = useState<any>(null);
  const [updatingBooking, setUpdatingBooking] = useState<number | null>(null);
  const [meetLinkModal, setMeetLinkModal] = useState<{ open: boolean; booking: any | null }>({ open: false, booking: null });
  const [meetLink, setMeetLink] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchTutorRequests();
    }
  }, [user]);

  const fetchTutorRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      // First, check if this user has a tutor profile
      const tutorRes = await fetch(`/api/tutors?user_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (tutorRes.ok) {
        const tutorsData = await tutorRes.json();
        const myTutor = Array.isArray(tutorsData) 
          ? tutorsData.find((t: any) => t.createdBy === user.id) 
          : null;

        if (myTutor) {
          setMyTutorProfile(myTutor);
          
          // Fetch booking requests for this tutor
          const bookingsRes = await fetch(`/api/bookings?tutor_id=${myTutor.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (bookingsRes.ok) {
            const requests = await bookingsRes.json();
            setTutorRequests(requests);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching tutor requests:", error);
    }
  };

  const handleAcceptBooking = (booking: any) => {
    setMeetLinkModal({ open: true, booking });
    setMeetLink(booking.meet_link || "");
  };

  const confirmAcceptBooking = async () => {
    if (!meetLinkModal.booking) return;
    setUpdatingBooking(meetLinkModal.booking.id);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${meetLinkModal.booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "accepted", meetLink }),
      });

      if (res.ok) {
        setMeetLinkModal({ open: false, booking: null });
        fetchTutorRequests();
      } else {
        alert("Failed to accept booking");
      }
    } catch (error) {
      console.error("Error accepting booking:", error);
    } finally {
      setUpdatingBooking(null);
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to reject this booking request?")) return;
    setUpdatingBooking(bookingId);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (res.ok) {
        fetchTutorRequests();
      } else {
        alert("Failed to reject booking");
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
    } finally {
      setUpdatingBooking(null);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      const response = await fetch(`/api/bookings?student_id=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login?redirect=/profile");
        return;
      }

      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditName(data.name);
        setEditBio(data.bio || "");
        setEditAvatar(data.avatarUrl || "");
        setLoading(false);
      } else if (response.status === 401) {
        router.push("/login?redirect=/profile");
      } else {
        alert("Failed to load profile");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const generateAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setEditAvatar(url);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=/profile");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          avatarUrl: editAvatar,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setVerifying(true);
    try {
      const response = await fetch("/api/profile/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => prev ? { ...prev, isVerified: true } : null);
        alert("Verification Successful! You are now a verified student.");
      } else {
        alert("Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("An error occurred during verification.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">User not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            {isEditing ? (
               <div className="flex flex-col items-center gap-2">
                 <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-blue-500">
                    {editAvatar ? (
                      <img src={editAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-3xl">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                 </div>
                 <button 
                   onClick={generateAvatar}
                   className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                 >
                   🎲 Randomize
                 </button>
               </div>
            ) : (
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-3xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-2xl font-bold"
                />
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Bio"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !editName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(user.name);
                      setEditBio(user.bio || "");
                      setEditAvatar(user.avatarUrl || "");
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {user.name}
                      {user.isVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800" title="Verified Student">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified Student
                        </span>
                      )}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">@{user.role || 'student'}</p>
                  </div>
                  <div className="flex gap-2">
                    {!user.isVerified && (
                       <button
                         onClick={handleVerify}
                         disabled={verifying}
                         className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                       >
                         {verifying ? (
                            <>Verifying...</>
                         ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Verify with SheerID
                            </>
                         )}
                       </button>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mt-4 whitespace-pre-wrap">
                  {user.bio || "No bio yet."}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.posts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.followers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.following}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
            </div>
          </div>
        </div>
        
        {/* Verification Badge Explanation Section */}
        {!user.isVerified && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                 <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Why verify with SheerID?</h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  Verifying your student status unlocks exclusive features, badge on your profile, and access to student-only tournaments and marketplace deals.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* My Bookings Section */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
           <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">My Tutor Sessions</h2>
           {bookings.length === 0 ? (
             <p className="text-gray-500">You have no booked sessions.</p>
           ) : (
             <div className="space-y-4">
               {bookings.map((booking) => (
                 <div key={booking.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Tutor: {booking.tutor_name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {booking.start_time ? new Date(booking.start_time).toLocaleString() : "Date not set"} 
                                ({booking.duration_minutes} mins)
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total: ${booking.total}</p>
                        </div>
                        <div className="text-right">
                             <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2
                                ${booking.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                  booking.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                             </span>
                             {booking.status === 'accepted' && booking.meet_link && (
                                <div>
                                    <a 
                                        href={booking.meet_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                    >
                                        Join Meeting
                                    </a>
                                </div>
                             )}
                        </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Tutor Booking Requests Section - Only show if user has a tutor profile */}
        {myTutorProfile && (
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                📚 Incoming Tutoring Requests
              </h2>
              <span className="text-sm text-gray-500">
                {tutorRequests.filter(r => r.status === 'pending').length} pending
              </span>
            </div>
            
            {tutorRequests.length === 0 ? (
              <p className="text-gray-500">No booking requests yet.</p>
            ) : (
              <div className="space-y-4">
                {tutorRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className={`p-4 rounded-lg border ${
                      request.status === 'pending' 
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' 
                        : request.status === 'accepted'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Student: {request.student_name || request.student_real_name || 'Anonymous'}
                        </h3>
                        {request.student_email && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{request.student_email}</p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          📅 {request.start_time ? new Date(request.start_time).toLocaleString() : "Date not set"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ⏱️ {request.duration_minutes} minutes • 💵 ${request.total}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Requested: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2
                          ${request.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        
                        {request.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAcceptBooking(request)}
                              disabled={updatingBooking === request.id}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectBooking(request.id)}
                              disabled={updatingBooking === request.id}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        
                        {request.status === 'accepted' && request.meet_link && (
                          <div className="mt-2">
                            <a 
                              href={request.meet_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                            >
                              Meeting Link
                            </a>
                          </div>
                        )}
                        
                        {request.status === 'accepted' && (
                          <button
                            onClick={() => handleAcceptBooking(request)}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                          >
                            Edit Link
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accept Booking Modal */}
      {meetLinkModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Accept Booking Request</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Please provide a meeting link for the session (e.g., Google Meet, Zoom, Microsoft Teams).
            </p>
            <input
              type="text"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded mb-4 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setMeetLinkModal({ open: false, booking: null })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAcceptBooking}
                disabled={updatingBooking !== null}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {updatingBooking !== null ? "Saving..." : "Accept & Send Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

