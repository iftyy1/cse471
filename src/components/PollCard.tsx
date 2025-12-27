"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PollOption {
  id: string;
  text: string;
}

interface Poll {
  id: number;
  title: string;
  description: string;
  options: PollOption[];
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

interface PollCardProps {
  poll: Poll;
  onVote?: () => void; // Callback to refresh parent if needed
}

export default function PollCard({ poll: initialPoll, onVote }: PollCardProps) {
  const router = useRouter();
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    if (storedToken) {
        fetchPollDetails(storedToken);
    }
  }, []);

  const fetchPollDetails = async (authToken: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/polls/${poll.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
        setUserVote(data.userVote);
      }
    } catch (error) {
      console.error("Error fetching poll details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) return;
    if (!token) {
      router.push("/login?redirect=/polls");
      return;
    }

    try {
      setVoting(true);
      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ optionId: selectedOption }),
      });

      if (res.ok) {
        await fetchPollDetails(token);
        if (onVote) onVote();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setVoting(false);
    }
  };

  const getTotalVotes = () => {
    if (!results) return 0;
    return Object.values(results).reduce((a, b) => a + b, 0);
  };

  const totalVotes = getTotalVotes();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="text-xl font-bold text-gray-800">{poll.title}</h3>
            {poll.description && <p className="text-gray-600 mt-1">{poll.description}</p>}
        </div>
        <div className="text-xs text-gray-500">
            {new Date(poll.created_at).toLocaleDateString()}
        </div>
      </div>

      {!token ? (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">Please login to view results and vote.</p>
          <button
            onClick={() => router.push("/login?redirect=/polls")}
            className="text-blue-600 hover:underline font-medium"
          >
            Login Now
          </button>
        </div>
      ) : (
        <div className="mt-4">
            {userVote ? (
                // Show Results
                <div className="space-y-4">
                    <p className="text-sm font-medium text-green-600 mb-2">✓ You have voted</p>
                    {poll.options.map((opt) => {
                        const count = results?.[opt.id] || 0;
                        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        const isUserChoice = userVote === opt.id;
                        
                        return (
                            <div key={opt.id} className="relative">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className={`font-medium ${isUserChoice ? 'text-blue-700' : 'text-gray-700'}`}>
                                        {opt.text} {isUserChoice && '(Your vote)'}
                                    </span>
                                    <span className="text-gray-500">{percentage}% ({count} votes)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className={`h-2.5 rounded-full ${isUserChoice ? 'bg-blue-600' : 'bg-gray-400'}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                    <div className="text-right text-sm text-gray-500 mt-2">
                        Total votes: {totalVotes}
                    </div>
                </div>
            ) : (
                // Show Voting Options
                <div className="space-y-3">
                    {poll.options.map((opt) => (
                        <label 
                            key={opt.id} 
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedOption === opt.id 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <input
                                type="radio"
                                name={`poll-${poll.id}`}
                                value={opt.id}
                                checked={selectedOption === opt.id}
                                onChange={() => setSelectedOption(opt.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-gray-700 font-medium">{opt.text}</span>
                        </label>
                    ))}
                    <button
                        onClick={handleVote}
                        disabled={!selectedOption || voting}
                        className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                            !selectedOption || voting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {voting ? 'Submitting...' : 'Vote'}
                    </button>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
