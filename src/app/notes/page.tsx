import PostFeed from "@/components/PostFeed";

export default function NotesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Notes and Tutorials
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Share your notes, tutorials, and helpful resources with the community.
          You can include YouTube links to embed videos directly in your posts.
        </p>
        <PostFeed type="note" />
      </div>
    </div>
  );
}
