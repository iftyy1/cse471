"use client";

import { useMemo, useState, useEffect } from "react";
import { tutorsData, Tutor } from "@/lib/data";

type DeliveryMode = "In Person" | "Virtual" | "Hybrid";

export default function TutorPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState<DeliveryMode | "All">("All");
  const [joined, setJoined] = useState<Record<number, boolean>>({});
  const [tutors, setTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await fetch("/api/tutors");
      if (response.ok) {
        const data = await response.json();
        setTutors(data);
      } else {
        setTutors(tutorsData);
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      setTutors(tutorsData);
    }
  };

  const uniqueSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    tutors.forEach((tutor) => tutor.subjects.forEach((subject) => subjectSet.add(subject)));
    return ["All", ...Array.from(subjectSet)];
  }, [tutors]);

  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      const matchesSubject = subjectFilter === "All" ? true : tutor.subjects.includes(subjectFilter);
      const matchesMode = modeFilter === "All" ? true : tutor.mode === modeFilter;
      return matchesSubject && matchesMode;
    });
  }, [subjectFilter, modeFilter, tutors]);

  const toggleDetails = (id: number) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleJoin = async (id: number) => {
    const studentName = prompt("Enter your name:");
    if (!studentName) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/tutors/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ student: studentName }),
      });

      if (response.ok) {
        setJoined((prev) => ({ ...prev, [id]: true }));
        fetchTutors(); // Refresh to update student count
        alert("Successfully joined the tutor session!");
      } else {
        const data = await response.json();
        alert(data.error || data.message || "Failed to join session");
      }
    } catch (error) {
      console.error("Error joining tutor session:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-wide text-purple-600 font-semibold">Student Tutors</p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
          Join peer-led tutoring cohorts or offer your expertise
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
          Discover vetted tutors, check availability, and reserve your spot. Each tutor shares subjects,
          delivery mode, and capacity so you can quickly match your learning style.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by subject
          </label>
          <div className="flex flex-wrap gap-3">
            {uniqueSubjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSubjectFilter(subject)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  subjectFilter === subject
                    ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Delivery mode
          </label>
          <div className="flex flex-wrap gap-3">
            {["All", "In Person", "Virtual", "Hybrid"].map((mode) => (
              <button
                key={mode}
                onClick={() => setModeFilter(mode as DeliveryMode | "All")}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  modeFilter === mode
                    ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTutors.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-10 text-center text-gray-600 dark:text-gray-400">
          No tutors match that filter yet. Check back soon or broaden your selection.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTutors.map((tutor) => {
            const isExpanded = expandedId === tutor.id;
            const isJoined = joined[tutor.id];
            const spotsLeft = tutor.maxStudents - tutor.joinedStudents;

            return (
              <div
                key={tutor.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{tutor.name}</h2>
                      <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200">
                        {tutor.mode}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{tutor.year}</p>
                    <p className="text-gray-700 dark:text-gray-200 mt-3 line-clamp-2">{tutor.headline}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {tutor.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hourly Rate</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">${tutor.hourlyRate}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {tutor.sessionsHosted} sessions • {tutor.rating.toFixed(1)}/5
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{tutor.availability}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {spotsLeft > 0 ? `${spotsLeft} seats open` : "Waitlist only"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleDetails(tutor.id)}
                    className="px-5 py-2 rounded-lg border border-purple-600 text-purple-600 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>
                  <button
                    onClick={() => handleJoin(tutor.id)}
                    disabled={isJoined || tutor.joinedStudents >= tutor.maxStudents}
                    className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                      isJoined
                        ? "bg-gray-200 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-300"
                        : tutor.joinedStudents >= tutor.maxStudents
                        ? "bg-gray-200 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-300"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {isJoined
                      ? "Already Joined"
                      : tutor.joinedStudents >= tutor.maxStudents
                      ? "Join Waitlist"
                      : "Join Session"}
                  </button>
                  <a
                    href={`mailto:${tutor.contactEmail}?subject=Tutoring inquiry for ${encodeURIComponent(tutor.name)}`}
                    className="px-5 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors"
                  >
                    Contact Tutor
                  </a>
                </div>

                {isExpanded && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Availability</p>
                        <p className="font-medium text-gray-900 dark:text-white">{tutor.availability}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Mode</p>
                        <p className="font-medium text-gray-900 dark:text-white">{tutor.mode}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Contact</p>
                        <p className="font-medium text-gray-900 dark:text-white">{tutor.contactEmail}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300">{tutor.description}</p>

                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Highlights</p>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                        {tutor.achievements.map((achievement) => (
                          <li key={achievement}>{achievement}</li>
                        ))}
                      </ul>
                    </div>

                    {isJoined && (
                      <div className="rounded-lg bg-purple-50 dark:bg-purple-900/30 p-4 text-sm text-purple-800 dark:text-purple-200">
                        You&apos;re confirmed! Your tutor will email you a resource bundle and onboarding steps within
                        24 hours.
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


