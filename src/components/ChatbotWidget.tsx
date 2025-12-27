"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatbotWidget() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  async function send() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      const data = await res.json();
      
      const content =
        data?.choices?.[0]?.message?.content || 
        data?.output || 
        data?.response || 
        (data?.error ? `Error: ${data.error}` : JSON.stringify(data));

      setMessages((prev) => [...prev, { role: "assistant", content: String(content) }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: could not reach chat service" }]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>🤖</span> AI Study Assistant
          </h3>
          <p className="text-xs text-blue-100 opacity-80">Powered by OpenRouter</p>
        </div>
        <button 
          onClick={() => setMessages([])} 
          className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded text-white transition-colors"
          title="Clear conversation"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-6">
            <div className="text-5xl mb-4">👋</div>
            <h4 className="text-xl font-medium text-gray-700 mb-2"> Hi! I&apos;m your study assistant. </h4>
            <p className="max-w-xs mx-auto">Ask me about your coursework, request practice problems, or get help with difficult concepts.</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
              <button 
                onClick={() => setInput("Explain the concept of recursion")} 
                className="text-sm p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 text-left transition-colors"
              >
                Explain recursion 🔄
              </button>
              <button 
                onClick={() => setInput("Generate a practice problem for SQL")} 
                className="text-sm p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 text-left transition-colors"
              >
                SQL Practice 📊
              </button>
              <button 
                onClick={() => setInput("Help me plan my study schedule")} 
                className="text-sm p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 text-left transition-colors"
              >
                Study Plan 📅
              </button>
              <button 
                onClick={() => setInput("What are the key principles of OOP?")} 
                className="text-sm p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 text-left transition-colors"
              >
                OOP Principles 💻
              </button>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 px-4 shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:bg-gray-100 prose-pre:p-2 prose-pre:rounded-lg text-gray-900">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl rounded-bl-none p-3 px-4 shadow-sm">
              <div className="flex space-x-2 items-center h-6">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 bg-white"
            placeholder="Type your question..."
            style={{ minHeight: '50px', maxHeight: '120px' }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">AI can make mistakes. Check important info.</p>
      </div>
    </div>
  );
}
