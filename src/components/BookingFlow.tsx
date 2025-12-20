"use client";

import { useState } from "react";

type Step = 1 | 2 | 3;

export default function BookingFlow({ tutor }: { tutor: any }) {
  const [step, setStep] = useState<Step>(1);
  const [dateTime, setDateTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [duration, setDuration] = useState<number>(60);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);

  const goNext = () => setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  async function submitBooking() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          tutorId: tutor.id,
          studentName: name || "Anonymous",
          startTime: dateTime,
          durationMinutes: duration,
        }),
      });
      const data = await res.json();
      setConfirmation(data);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold">Book {tutor.name}</h3>
      {step === 1 && (
        <div className="mt-4">
          <label className="block text-sm">Your name</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="border p-2 w-full rounded focus:ring-2 focus:ring-purple-500 outline-none text-gray-900" 
            placeholder="John Doe"
          />
          <label className="block text-sm mt-3">Choose start time</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
          />
          <div className="flex justify-end mt-4">
            <button onClick={goNext} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
              Next: Hourly details
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4">
          <p className="text-sm">Hourly rate: ${tutor.hourlyRate}/hr</p>
          <label className="block text-sm mt-3">Duration (minutes)</label>
          <input
            type="number"
            min={15}
            step={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
          />
          <p className="mt-2 font-medium">Estimated total: ${(tutor.hourlyRate * (duration / 60)).toFixed(2)}</p>
          <div className="flex justify-between mt-4">
            <button onClick={goBack} className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors">
              Back
            </button>
            <button onClick={submitBooking} disabled={loading} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50">
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-4 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h4 className="font-bold text-xl mb-2">Booking Confirmed!</h4>
          <p className="text-gray-600 mb-4">You have successfully booked a session with {tutor.name}.</p>
          <div className="bg-gray-50 p-4 rounded text-left text-sm mb-4">
            <p><strong>Date:</strong> {new Date(dateTime).toLocaleString()}</p>
            <p><strong>Duration:</strong> {duration} minutes</p>
            <p><strong>Total:</strong> ${(tutor.hourlyRate * (duration / 60)).toFixed(2)}</p>
          </div>
          <div className="flex justify-center mt-3">
            <button onClick={() => window.location.href = '/tutors'} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
              Return to Tutors
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
