"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tutor } from "@/lib/data";

type DeliveryMode = "In Person" | "Virtual" | "Hybrid";

export default function TutorPage() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState<DeliveryMode | "All">("All");
  const [joined, setJoined] = useState<Record<number, boolean>>({});
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    description: "",
    hourlyRate: "",
    year: "Freshman",
    mode: "Virtual",
    availability: "",
    subjects: "",
    contactEmail: "",
    achievements: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        router.push("/login?redirect=/tutors");
        return;
    }

    fetchTutors().finally(() => setIsLoading(false));
    
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleAuthChange = () => {
      const u = localStorage.getItem("user");
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await fetch("/api/tutors");
      if (response.ok) {
        const data = await response.json();
        setTutors(data);
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      setTutors([]);
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

  const handleJoin = async (tutor: Tutor) => {
    if (tutor.joinedStudents >= tutor.maxStudents) {
      // Join Waitlist
      try {
        const token = localStorage.getItem("token");
        if (!token || !user) {
            alert("Please login to join the waitlist");
            return;
        }

        const res = await fetch(`/api/tutors/${tutor.id}/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ student: user.name })
        });

        if (res.ok || res.status === 409) {
            setJoined((prev) => ({ ...prev, [tutor.id]: true }));
            alert("Added to waitlist!");
        } else {
            alert("Failed to join waitlist");
        }
      } catch (error) {
        console.error("Error joining waitlist:", error);
      }
    } else {
      router.push(`/tutors/${tutor.id}/book`);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tutors", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          ...formData,
          hourlyRate: Number(formData.hourlyRate),
          subjects: formData.subjects.split(",").map((s) => s.trim()),
          achievements: formData.achievements.split(",").map((a) => a.trim()),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchTutors();
        
        // Update local user role
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (currentUser.role !== 'admin' && currentUser.role !== 'student_tutor') {
            currentUser.role = 'student_tutor';
            localStorage.setItem("user", JSON.stringify(currentUser));
            // Trigger auth change event for Navbar to pick up
            window.dispatchEvent(new Event("authChange"));
        }

        alert("Service posted successfully!");
        setFormData({
            name: "",
            headline: "",
            description: "",
            hourlyRate: "",
            year: "Freshman",
            mode: "Virtual",
            availability: "",
            subjects: "",
            contactEmail: "",
            achievements: "",
        });
      } else {
        alert("Failed to post service");
      }
    } catch (error) {
      console.error("Error posting service:", error);
    }
  };

  return (
    <>
    {isLoading ? (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    ) : (
      <>
    <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm uppercase tracking-wide text-purple-600 font-semibold">Student Tutors</p>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
                Join peer-led tutoring cohorts or offer your expertise
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
                Discover vetted tutors, check availability, and reserve your spot. Each tutor shares subjects,
                delivery mode, and capacity so you can quickly match your learning style.
                </p>
            </div>
            {user && (
                <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm whitespace-nowrap"
                >
                Post Your Service
                </button>
            )}
        </div>
      </div>

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Post Tutoring Service</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Headline</label>
                  <input
                    name="headline"
                    required
                    placeholder="e.g. CS Major specializing in Algorithms"
                    value={formData.headline}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate ($)</label>
                    <input
                        name="hourlyRate"
                        type="number"
                        required
                        min="0"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year/Level</label>
                    <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option>Freshman</option>
                        <option>Sophomore</option>
                        <option>Junior</option>
                        <option>Senior</option>
                        <option>Grad Student</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode</label>
                    <select
                        name="mode"
                        value={formData.mode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option>Virtual</option>
                        <option>In Person</option>
                        <option>Hybrid</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability</label>
                    <input
                        name="availability"
                        required
                        placeholder="e.g. Weekends, Mon/Wed evenings"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subjects (comma separated)</label>
                <input
                    name="subjects"
                    required
                    placeholder="Math, Physics, React"
                    value={formData.subjects}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                <input
                    name="contactEmail"
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Achievements (comma separated)</label>
                <input
                    name="achievements"
                    placeholder="Dean's List, Hackathon Winner"
                    value={formData.achievements}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Post Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    onClick={() => handleJoin(tutor)}
                    disabled={isJoined}
                    className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                      isJoined
                        ? "bg-gray-200 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-300"
                        : tutor.joinedStudents >= tutor.maxStudents
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200"
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
      </>
    )}
    </>
  );
}


