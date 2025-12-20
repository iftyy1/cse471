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

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

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
      </div>
    </div>
  );
}

