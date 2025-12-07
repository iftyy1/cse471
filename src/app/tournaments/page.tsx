"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tournamentsData, TournamentStatus } from "@/lib/data";

export default function TournamentPage() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [joined, setJoined] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<TournamentStatus | "All">("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch("/api/tournaments");
      if (response.ok) {
        const data = await response.json();
        setTournaments(data);
      } else {
        setTournaments(tournamentsData);
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      setTournaments(tournamentsData);
    }
  };

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => (filter === "All" ? true : tournament.status === filter));
  }, [filter, tournaments]);

  const toggleDetails = (id: number) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleJoin = async (id: number) => {
    const participantName = prompt("Enter your name or team name:");
    if (!participantName) return;

    try {
      const response = await fetch(`/api/tournaments/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ participant: participantName }),
      });

      if (response.ok) {
        setJoined((prev) => ({ ...prev, [id]: true }));
        fetchTournaments(); // Refresh to update participant count
        alert("Successfully joined the tournament!");
      } else {
        const data = await response.json();
        alert(data.error || data.message || "Failed to join tournament");
      }
    } catch (error) {
      console.error("Error joining tournament:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleAddTournament = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      alert("Please login to create a tournament");
      router.push("/login?redirect=/tournaments");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const rules = formData.get("rules")?.toString().split("\n").filter(r => r.trim()) || [];
    const tags = formData.get("tags")?.toString().split(",").map(t => t.trim()).filter(t => t) || [];

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.get("title"),
          organizer: formData.get("organizer"),
          category: formData.get("category"),
          location: formData.get("location"),
          dateRange: formData.get("dateRange"),
          registrationDeadline: formData.get("registrationDeadline"),
          prizePool: formData.get("prizePool"),
          maxParticipants: parseInt(formData.get("maxParticipants")?.toString() || "0"),
          description: formData.get("description"),
          rules,
          tags,
          status: formData.get("status") || "Upcoming",
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        fetchTournaments();
        alert("Tournament created successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create tournament");
      }
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-600 font-semibold">
            Tournament & Event Management
          </p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
            Track competitions and join upcoming events
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
            Browse featured tournaments across campus, monitor enrollment limits, review rules, and join
            directly. Status indicators keep you up to date on ongoing brackets and registration windows.
          </p>
        </div>
        <button
          onClick={() => {
            if (!token) {
              alert("Please login to create a tournament");
              router.push("/login?redirect=/tournaments");
            } else {
              setShowAddModal(true);
            }
          }}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          + Add Tournament
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by status
        </label>
        <div className="flex flex-wrap gap-3">
          {["All", "Upcoming", "Ongoing", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as TournamentStatus | "All")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filter === status
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredTournaments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-10 text-center text-gray-600 dark:text-gray-400">
          No tournaments match that filter. Check back soon!
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTournaments.map((tournament) => {
            const isExpanded = expandedId === tournament.id;
            const isJoined = joined[tournament.id];
            const spotsLeft = tournament.maxParticipants - tournament.enrolledParticipants;

            return (
              <div
                key={tournament.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full ${
                          tournament.status === "Upcoming"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                            : tournament.status === "Ongoing"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {tournament.status}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reg. by {tournament.registrationDeadline}</p>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{tournament.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{tournament.organizer}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600 dark:text-gray-300">
                      <span>{tournament.category}</span>
                      <span className="inline-flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-emerald-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                        {tournament.location}
                      </span>
                      <span>{tournament.dateRange}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prize Pool</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{tournament.prizePool}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {tournament.enrolledParticipants}/{tournament.maxParticipants} teams registered
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {spotsLeft > 0 ? `${spotsLeft} spots left` : "Waitlist only"}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mt-4 line-clamp-2">{tournament.description}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {tournament.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleDetails(tournament.id)}
                    className="px-5 py-2 rounded-lg border border-emerald-600 text-emerald-600 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>
                  <button
                    onClick={() => handleJoin(tournament.id)}
                    disabled={isJoined || tournament.enrolledParticipants >= tournament.maxParticipants}
                    className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                      isJoined
                        ? "bg-gray-200 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-300"
                        : tournament.enrolledParticipants >= tournament.maxParticipants
                        ? "bg-gray-200 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-300"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {isJoined
                      ? "Already Joined"
                      : tournament.enrolledParticipants >= tournament.maxParticipants
                      ? "Join Waitlist"
                      : "Join Tournament"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Schedule</p>
                        <p className="font-medium text-gray-900 dark:text-white">{tournament.dateRange}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Check-in</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(tournament.registrationDeadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Format</p>
                        <p className="font-medium text-gray-900 dark:text-white">{tournament.category}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Rules & Requirements</p>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                        {tournament.rules.map((rule) => (
                          <li key={rule}>{rule}</li>
                        ))}
                      </ul>
                    </div>

                    {isJoined && (
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                        You&apos;re officially on the roster! Expect a confirmation email with brackets
                        and briefing materials.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Tournament Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Tournament</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddTournament} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Organizer *
                    </label>
                    <input
                      type="text"
                      name="organizer"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date Range *
                    </label>
                    <input
                      type="text"
                      name="dateRange"
                      placeholder="e.g. Dec 5 - Dec 7, 2025"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Registration Deadline *
                    </label>
                    <input
                      type="date"
                      name="registrationDeadline"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prize Pool *
                    </label>
                    <input
                      type="text"
                      name="prizePool"
                      placeholder="e.g. $4,000 cash"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Participants *
                    </label>
                    <input
                      type="number"
                      name="maxParticipants"
                      min="1"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rules (one per line)
                  </label>
                  <textarea
                    name="rules"
                    rows={3}
                    placeholder="Rule 1&#10;Rule 2&#10;Rule 3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="e.g. Hackathon, Team Event"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Create Tournament"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


