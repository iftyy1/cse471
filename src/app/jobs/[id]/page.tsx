"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  salary_min: number | null;
  salary_max: number | null;
  application_deadline: string | null;
  created_at: string;
  posted_by_name: string;
  posted_by_email: string;
  application_count: number;
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    cover_letter: "",
    resume_url: "",
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    fetchJobDetails();
  }, [params.id]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        router.push("/jobs");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!token) {
      router.push("/login?redirect=/jobs/" + params.id);
      return;
    }

    setApplying(true);
    try {
      const response = await fetch(`/api/jobs/${params.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        setApplicationData({ cover_letter: "", resume_url: "" });
      } else {
        const data = await response.json();
        alert(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Job not found</p>
          <Link href="/jobs" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/jobs"
        className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
      >
        ← Back to Jobs
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {job.title}
        </h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 mb-6">
          {job.company}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {job.location}
          </div>
          <div className="flex items-center">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {job.type}
            </span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {formatSalary(job.salary_min, job.salary_max)}
          </div>
          {job.application_deadline && (
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Deadline: {formatDate(job.application_deadline)}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Job Description
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Requirements
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.requirements}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Posted by {job.posted_by_name} on {formatDate(job.created_at)} • {job.application_count} applications
          </p>
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Apply for this Position
        </h2>
        {!token ? (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please login to apply for this job
            </p>
            <Link
              href={`/login?redirect=/jobs/${params.id}`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Login
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Letter
              </label>
              <textarea
                value={applicationData.cover_letter}
                onChange={(e) =>
                  setApplicationData({
                    ...applicationData,
                    cover_letter: e.target.value,
                  })
                }
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Write your cover letter here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resume URL (optional)
              </label>
              <input
                type="url"
                value={applicationData.resume_url}
                onChange={(e) =>
                  setApplicationData({
                    ...applicationData,
                    resume_url: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/resume.pdf"
              />
            </div>
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {applying ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

