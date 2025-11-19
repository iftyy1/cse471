"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  bio: string;
  posts: number;
  followers: number;
  following: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile
    // For now, using mock data
    setUser({
      id: 1,
      name: "Current User",
      email: "user@example.com",
      bio: "Student at University",
      posts: 5,
      followers: 120,
      following: 85,
    });
    setLoading(false);
  }, []);

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
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{user.bio}</p>
            <div className="flex space-x-6">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.posts}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  Posts
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.followers}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  Followers
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.following}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  Following
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            About
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
        </div>
      </div>
    </div>
  );
}

