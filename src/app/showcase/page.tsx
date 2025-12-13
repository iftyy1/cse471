import ProjectShowcase from "@/components/ProjectShowcase";

export default function ShowcasePage() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">My Projects</h1>
      <div className="mt-4">
        <ProjectShowcase />
      </div>
    </main>
  );
}
