import BookingFlow from "@/components/BookingFlow";
import { tutorsData } from "@/lib/data";

export default function BookTutorPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const tutor = tutorsData.find((t) => t.id === id) || {
    id,
    name: "Unknown",
    hourlyRate: 20,
  };

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Book {tutor.name}</h1>
      <div className="mt-4">
        {/* BookingFlow is a client component */}
        {/* @ts-ignore server->client */}
        <BookingFlow tutor={tutor} />
      </div>
    </main>
  );
}
