import PostFeed from "@/components/PostFeed";

export default function DashboardHome() {
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
      
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Campus Location
        </h2>
        <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight={0} 
            marginWidth={0} 
            src="https://maps.google.com/maps?q=Brac+University&t=&z=15&ie=UTF8&iwloc=&output=embed"
            title="Brac University Map"
            aria-label="Brac University Location"
          >
          </iframe>
        </div>
      </div>
    </div>
  );
}
