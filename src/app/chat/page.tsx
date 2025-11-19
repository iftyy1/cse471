"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

interface ChatMessage {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

const REFRESH_INTERVAL = 5000;

export default function GlobalChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/chat");
      if (!response.ok) throw new Error("Failed to load chat history");
      const data = await response.json();
      setMessages(data);
      setError(null);
    } catch (err) {
      setError("Unable to load chat right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!author.trim() || !content.trim()) {
      setError("Both name and message are required.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author.trim(), content: content.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setContent("");
      fetchMessages();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-wide text-indigo-600 font-semibold">Global Chat</p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-1">Campus Commons</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Drop study tips, celebrate wins, or ask for help. Everyone sees the same live feed.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="h-96 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">Loading chat...</p>
          ) : sortedMessages.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">No messages yet. Start the conversation!</p>
          ) : (
            sortedMessages.map((message) => (
              <div key={message.id} className="flex flex-col">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">{message.author}</span>
                  <span>•</span>
                  <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="mt-1 inline-flex max-w-full rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 px-4 py-2 text-gray-900 dark:text-gray-100">
                  {message.content}
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 px-6 py-6 bg-white dark:bg-gray-800">
          {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Display name"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              className="w-full sm:w-1/3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Type a message..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={500}
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-2xl bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


