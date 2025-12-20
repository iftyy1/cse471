import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 md:py-32">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Empowering Students to <br className="hidden md:block" />
            Connect, Grow, and Succeed
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Your all-in-one platform for campus life. Join communities, find tutors, explore careers, and trade in the marketplace.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-gray-50 transition-transform hover:-translate-y-1"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 bg-blue-800 bg-opacity-50 text-white font-bold rounded-lg border border-blue-400 hover:bg-blue-800 transition-transform hover:-translate-y-1"
            >
              Log In
            </Link>
          </div>
        </div>
        
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
             </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need in One Place</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              StudentHub brings together all the essential tools for student life, streamlining your university experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Vibrant Community</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join global chats, participate in tournaments, and connect with peers who share your interests.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Career Growth</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build your resume, showcase your projects, and find job opportunities tailored for students.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Academic Support</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find expert tutors, get AI assistance, and access resources to excel in your studies.
              </p>
            </div>
          </div>
        </div>
      </section>

       {/* Marketplace & More Section */}
       <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                         {/* Placeholder for an image or just a nice gradient block */}
                         <div className="h-64 bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white text-2xl font-bold">
                            Student Marketplace
                         </div>
                    </div>
                </div>
                <div className="flex-1 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        Buy, Sell, and Trade Securely
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Turn your old textbooks into cash, find affordable dorm essentials, or recover lost items with our dedicated Lost & Found service.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Verified Student Listings
                        </li>
                        <li className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Secure Campus Exchanges
                        </li>
                         <li className="flex items-center text-gray-700 dark:text-gray-300">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Lost & Found Tracking
                        </li>
                    </ul>
                     <div className="pt-4">
                        <Link href="/marketplace" className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center">
                            Explore Marketplace
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
       </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join Your Campus Community?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Sign up today and start connecting with students, finding opportunities, and making the most of your university journey.
          </p>
          <Link 
            href="/register" 
            className="px-10 py-4 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-all hover:scale-105 inline-block"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
            <div>
                <h4 className="text-white text-lg font-bold mb-4">StudentHub</h4>
                <p className="text-sm">Making student life easier, one connection at a time.</p>
            </div>
            <div>
                <h4 className="text-white text-lg font-bold mb-4">Community</h4>
                <ul className="space-y-2 text-sm">
                    <li><Link href="#" className="hover:text-white">Global Chat</Link></li>
                    <li><Link href="#" className="hover:text-white">Tournaments</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white text-lg font-bold mb-4">Support</h4>
                <ul className="space-y-2 text-sm">
                    <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                    <li><Link href="#" className="hover:text-white">Safety</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white text-lg font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                    <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                </ul>
            </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            &copy; {new Date().getFullYear()} StudentHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
