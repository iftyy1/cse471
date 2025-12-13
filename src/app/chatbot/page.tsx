import ChatbotWidget from "@/components/ChatbotWidget";

export default function ChatbotPage() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">AI Study Assistant</h1>
      <div className="mt-4">
        <ChatbotWidget />
      </div>
    </main>
  );
}
