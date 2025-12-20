"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Comment {
  id: number;
  content: string;
  user_name: string;
  created_at: string;
}

interface Item {
  id: number;
  title: string;
  description: string;
  type: "Lost" | "Found";
  location: string;
  date_lost_found: string;
  image_url: string;
  contact_info: string;
  status: string;
  user_name: string;
  created_at: string;
  comments: Comment[];
}

export default function LostFoundPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Lost" | "Found">("Lost");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Lost",
    location: "",
    date_lost_found: "",
    contact_info: "",
    image_url: "",
  });
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lost-found?type=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/lost-found", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
            title: "",
            description: "",
            type: "Lost",
            location: "",
            date_lost_found: "",
            contact_info: "",
            image_url: "",
        });
        fetchItems();
      } else {
        alert("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const handleCommentSubmit = async (itemId: number) => {
    const content = newComment[itemId];
    if (!content?.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/lost-found/${itemId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setNewComment({ ...newComment, [itemId]: "" });
        fetchItems(); // Refresh to show new comment
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Lost & Found Portal
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Post Item
        </button>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("Lost")}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "Lost"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Lost Items
        </button>
        <button
          onClick={() => setActiveTab("Found")}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === "Found"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Found Items
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {item.image_url && (
                <div className="h-48 overflow-hidden relative">
                   <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.type === "Lost"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-medium">Location:</span> {item.location}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(item.date_lost_found).toLocaleDateString()}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {item.description}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-medium">Contact:</span> {item.contact_info}
                </p>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold mb-2">Comments</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                    {item.comments && item.comments.length > 0 ? (
                      item.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm"
                        >
                          <span className="font-bold text-gray-900 dark:text-white mr-2">
                            {comment.user_name}:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {comment.content}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No comments yet.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment[item.id] || ""}
                      onChange={(e) =>
                        setNewComment({
                          ...newComment,
                          [item.id]: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-1 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button
                      onClick={() => handleCommentSubmit(item.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Post Lost/Found Item
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as "Lost" | "Found" })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date_lost_found}
                  onChange={(e) =>
                    setFormData({ ...formData, date_lost_found: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Info
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_info}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_info: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
               <div>
                <label className="block text-sm font-medium mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
