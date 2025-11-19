"use client";

import { useMemo, useState } from "react";
import { tournamentsData, TournamentStatus } from "@/lib/data";

export default function TournamentPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [joined, setJoined] = useState<Record<number, boolean>>({});
  const [filter, setFilter] = useState<TournamentStatus | "All">("All");

  const filteredTournaments = useMemo(() => {
    return tournamentsData.filter((tournament) => (filter === "All" ? true : tournament.status === filter));
  }, [filter]);

  const toggleDetails = (id: number) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleJoin = (id: number) => {
    setJoined((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
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
    </div>
  );
}


