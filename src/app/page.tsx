import PostFeed from "@/components/PostFeed";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Student Social Media
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect, share, and engage with fellow students
        </p>
      </div>
      <PostFeed />
    </div>
  );
}

