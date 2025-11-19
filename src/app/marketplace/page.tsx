"use client";

import { useMemo, useState } from "react";
import { marketplaceListings, MarketplaceListing } from "@/lib/data";

export default function MarketplacePage() {
  const [expandedListingId, setExpandedListingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Book" | "Notes">("All");

  const filteredListings = useMemo(() => {
    return marketplaceListings.filter((listing) => {
      const matchesSearch =
        listing.title.toLowerCase().includes(search.toLowerCase()) ||
        listing.course.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" ? true : listing.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [search, typeFilter]);

  const toggleDetails = (id: number) => {
    setExpandedListingId((current) => (current === id ? null : id));
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
          Book & Notes Marketplace
        </p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
          Trade study materials with trusted classmates
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
          Browse curated listings for textbooks, lab notebooks, and exam-ready notes. Each listing
          includes seller details, delivery options, and quick links to contact the seller directly.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search by title or course
            </label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="e.g. Calculus, CSE 312, Organic Chemistry"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as MarketplaceListing["type"] | "All")}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Listings</option>
              <option value="Book">Books</option>
              <option value="Notes">Notes</option>
            </select>
          </div>
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-10 text-center text-gray-600 dark:text-gray-400">
          No listings match your filters yet. Try adjusting the search terms or type filter.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredListings.map((listing) => {
            const isExpanded = expandedListingId === listing.id;
            return (
              <div
                key={listing.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                        {listing.type}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Posted {listing.postedAt}</p>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                      {listing.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{listing.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">${listing.price}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{listing.condition}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    {listing.location}
                  </span>
                  {listing.deliveryOptions.map((option) => (
                    <span
                      key={option}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900"
                    >
                      {option}
                    </span>
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mt-4 line-clamp-2">{listing.description}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleDetails(listing.id)}
                    className="px-5 py-2 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>
                  <a
                    href={`mailto:${listing.contactEmail}?subject=Interested in ${encodeURIComponent(listing.title)}`}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                  >
                    Contact Seller
                  </a>
                </div>

                {isExpanded && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Seller</p>
                        <p className="text-gray-900 dark:text-white font-medium">{listing.seller}</p>
                        <p className="text-gray-600 dark:text-gray-300">{listing.sellerYear}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Preview Pages</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {listing.previewPages > 0 ? `${listing.previewPages}+ sample pages` : "Available on request"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-gray-900 dark:text-white font-medium">{listing.contactEmail}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Highlights</p>
                      <div className="flex flex-wrap gap-2">
                        {listing.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


