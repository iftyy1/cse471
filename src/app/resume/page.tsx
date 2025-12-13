import ResumeBuilder from "@/components/ResumeBuilder";

export default function ResumePage() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Resume Builder</h1>
      <div className="mt-4">
        <ResumeBuilder />
      </div>
    </main>
  );
}
