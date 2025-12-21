"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BookingFlow from "@/components/BookingFlow";

export default function BookTutorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = Number(params.id);
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=/tutors/" + id + "/book");
      return;
    }

    const fetchTutor = async () => {
      try {
        const res = await fetch("/api/tutors");
        if (res.ok) {
          const data = await res.json();
          const found = Array.isArray(data) ? data.find((t: any) => t.id === id) : null;
          if (found) {
            setTutor(found);
          } else {
            // Tutor not found
            alert("Tutor not found");
            router.push("/tutors");
          }
        }
      } catch (e) {
        console.error("Error fetching tutor:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id, router]);

  if (loading) {
    return (
      <main className="container mx-auto p-6">
        <div className="text-center">Loading tutor details...</div>
      </main>
    );
  }

  if (!tutor) {
    return (
      <main className="container mx-auto p-6">
        <div className="text-center text-red-500">Tutor not found</div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Session with {tutor.name}</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">{tutor.headline}</p>
      <div className="mt-4">
        <BookingFlow tutor={tutor} />
      </div>
    </main>
  );
}
