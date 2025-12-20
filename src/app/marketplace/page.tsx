"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { marketplaceListings, MarketplaceListing } from "@/lib/data";

export default function MarketplacePage() {
  const router = useRouter();
  const [expandedListingId, setExpandedListingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Book" | "Notes">("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
        router.push("/login?redirect=/marketplace");
        return;
    }
    setToken(storedToken);
    fetchListings().finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const fetchListings = async () => {
    try {
      const response = await fetch("/api/marketplace");
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      } else {
        setListings(marketplaceListings);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      setListings(marketplaceListings);
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.title.toLowerCase().includes(search.toLowerCase()) ||
        (listing.course?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesType = typeFilter === "All" ? true : listing.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [search, typeFilter, listings]);

  const toggleDetails = (id: number) => {
    setExpandedListingId((current) => (current === id ? null : id));
  };

  const handleAddListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      alert("Please login to create a listing");
      router.push("/login?redirect=/marketplace");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const deliveryOptions = formData.get("deliveryOptions")?.toString().split("\n").filter(o => o.trim()) || [];
    const highlights = formData.get("highlights")?.toString().split("\n").filter(h => h.trim()) || [];

    try {
      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.get("title"),
          type: formData.get("type"),
          course: formData.get("course"),
          price: parseFloat(formData.get("price")!.toString()),
          condition: formData.get("condition"),
          location: formData.get("location"),
          deliveryOptions,
          description: formData.get("description"),
          highlights,
          contactEmail: formData.get("contactEmail"),
          previewPages: formData.get("previewPages") ? parseInt(formData.get("previewPages")!.toString()) : 0,
          sellerName: formData.get("sellerName"),
          sellerYear: formData.get("sellerYear"),
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        fetchListings();
        alert("Listing created successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create listing");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8 flex justify-between items-start">
        <div>
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
        <button
          onClick={() => {
            if (!token) {
              alert("Please login to create a listing");
              router.push("/login?redirect=/marketplace");
            } else {
              setShowAddModal(true);
            }
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Listing
        </button>
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
              onChange={(event) => setTypeFilter(event.target.value as "All" | "Book" | "Notes")}
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
                          {listing.previewPages && listing.previewPages > 0 ? `${listing.previewPages}+ sample pages` : "Available on request"}
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
                        {(listing.highlights || []).map((highlight) => (
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

      {/* Add Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Listing</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddListing} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type *
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select type</option>
                      <option value="Book">Book</option>
                      <option value="Notes">Notes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course *
                    </label>
                    <input
                      type="text"
                      name="course"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Condition *
                    </label>
                    <input
                      type="text"
                      name="condition"
                      placeholder="e.g. Like New, Good"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Seller Name *
                    </label>
                    <input
                      type="text"
                      name="sellerName"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Seller Year *
                    </label>
                    <input
                      type="text"
                      name="sellerYear"
                      placeholder="e.g. Sophomore • Computer Science"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Delivery Options (one per line)
                  </label>
                  <textarea
                    name="deliveryOptions"
                    rows={3}
                    placeholder="Option 1&#10;Option 2"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Highlights (one per line)
                  </label>
                  <textarea
                    name="highlights"
                    rows={3}
                    placeholder="Highlight 1&#10;Highlight 2"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preview Pages
                  </label>
                  <input
                    type="number"
                    name="previewPages"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Create Listing"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


