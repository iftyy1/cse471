"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Post {
  id: number;
  content: string;
  author: string;
  authorId: number;
  createdAt: string;
  likes: number;
  comments: number;
}

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const handleLike = async () => {
    if (!token) {
      alert("Please login to like posts");
      router.push("/login?redirect=/");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      } else if (response.status === 401) {
        alert("Please login to like posts");
        router.push("/login?redirect=/");
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    if (!token) {
      alert("Please login to comment");
      router.push("/login?redirect=/");
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (response.ok) {
        setNewComment("");
        fetchComments();
        setCommentCount(commentCount + 1);
        onUpdate();
      } else if (response.status === 401) {
        alert("Please login to comment");
        router.push("/login?redirect=/");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {post.author.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {post.author}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(post.createdAt)}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
            {post.content}
          </p>
          <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${
                liked
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{likeCount}</span>
            </button>
            <button
              onClick={toggleComments}
              className="flex items-center space-x-2 px-3 py-1 rounded-md text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{commentCount}</span>
            </button>
          </div>
          {showComments && (
            <div className="mt-4 space-y-4">
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {comment.author}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && handleComment()}
                />
                <button
                  onClick={handleComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

