"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserName(user.name);
        setUserRole(user.role);
      } catch (error) {
        setIsLoggedIn(false);
        setUserName(null);
        setUserRole(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserName(null);
      setUserRole(null);
    }
  };

  useEffect(() => {
    checkAuth();
    const handleStorageChange = () => checkAuth();
    const handleAuthChange = () => checkAuth();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleAuthChange);
    
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName(null);
    setUserRole(null);
    window.dispatchEvent(new Event("authChange"));
    router.push("/");
    router.refresh();
  };

  const navGroups = [
    { 
      label: "Community", 
      items: [
        { href: "/chat", label: "Global Chat" },
        { href: "/chatbot", label: "AI Tutor" },
        { href: "/tournaments", label: "Tournaments" },
        { href: "/notes", label: "Notes and Tutorials" },
        { href: "/polls", label: "Polls & Surveys" }
      ]
    },
    { 
      label: "Career", 
      items: [
        { href: "/jobs", label: "Jobs" },
        { href: "/showcase", label: "Projects" },
        { href: "/resume", label: "Resume Builder" }
      ]
    },
    { 
      label: "Services", 
      items: [
        { href: "/marketplace", label: "Marketplace" },
        { href: "/tutors", label: "Tutoring" },
        { href: "/lost-found", label: "Lost & Found" }
      ]
    }
  ];

  const toggleDropdown = (label: string) => {
    if (activeDropdown === label) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(label);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            UNET
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6" ref={dropdownRef}>
            <Link 
                href="/" 
                className={`text-sm font-medium hover:text-blue-600 transition-colors ${pathname === "/" ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}
            >
                Home
            </Link>

            {isLoggedIn && navGroups.map((group) => (
              <div key={group.label} className="relative">
                <button
                  onClick={() => toggleDropdown(group.label)}
                  className={`flex items-center text-sm font-medium hover:text-blue-600 transition-colors ${
                    activeDropdown === group.label ? "text-blue-600" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {group.label}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeDropdown === group.label && (
                  <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 border border-gray-100 dark:border-gray-600">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
                          pathname === item.href ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoggedIn && (
               <Link 
                href="/profile" 
                className={`text-sm font-medium hover:text-blue-600 transition-colors ${pathname === "/profile" ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}
                >
                Profile
               </Link>
            )}
          </div>

          {/* Auth Buttons & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
                {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                    <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{userName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole?.replace('_', ' ')}</div>
                    </div>
                    {userRole === 'admin' && (
                      <Link
                        href="/admin"
                        className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    {userRole === 'student_tutor' && (
                      <Link
                        href="/tutors/dashboard"
                        className="px-3 py-2 rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        Tutor Dashboard
                      </Link>
                    )}
                    <button
                    onClick={handleSignOut}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                    Sign Out
                    </button>
                </div>
                ) : (
                <>
                    <Link
                    href="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                    Login
                    </Link>
                    <Link
                    href="/register"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                    Register
                    </Link>
                </>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/" ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
                Home
            </Link>
            {isLoggedIn && navGroups.map((group) => (
                <div key={group.label} className="space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {group.label}
                    </div>
                    {group.items.map((item) => (
                        <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                            pathname === item.href
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        >
                        {item.label}
                        </Link>
                    ))}
                </div>
            ))}
             {isLoggedIn && (
               <Link 
                href="/profile" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === "/profile" ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                >
                Profile
               </Link>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {isLoggedIn ? (
                <div className="space-y-3 px-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="text-base font-medium text-gray-800 dark:text-white">{userName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{userRole?.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
