"use client";

import { useState, useEffect } from "react";
import CreatePollModal from "@/components/CreatePollModal";
import PollCard from "@/components/PollCard";

interface Poll {
  id: number;
  title: string;
  description: string;
  options: any[];
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    checkUser();
    fetchPolls();
  }, []);

  const checkUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr);
        if (user.role === "admin") {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  };

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/polls?filter=active");
      if (res.ok) {
        const data = await res.json();
        setPolls(data.polls);
      }
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 text-center relative">
            <h1 className="text-3xl font-bold text-gray-900">Polls & Surveys</h1>
            <p className="text-gray-600 mt-2">Participate in community decisions and share your opinion</p>
            {isLoggedIn && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 md:absolute md:right-0 md:top-0 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                + Create Poll
              </button>
            )}
        </div>

        <CreatePollModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={fetchPolls}
        />

        {loading ? (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        ) : polls.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-medium text-gray-900">No active polls</h3>
                <p className="text-gray-500 mt-2">Check back later for new polls and surveys.</p>
            </div>
        ) : (
            <div className="space-y-6">
                {polls.map((poll) => (
                    <PollCard key={poll.id} poll={poll} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
