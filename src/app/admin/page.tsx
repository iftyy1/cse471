"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreatePollModal from "@/components/CreatePollModal";

interface StatCardsProps {
  stats: any;
}

function StatCards({ stats }: StatCardsProps) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value as number}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");
  const [stats, setStats] = useState(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchStats();
    fetchData(activeTab);
  }, [activeTab]);

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setStats(await res.json());
  };

  const fetchData = async (tab: string) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    let endpoint = "";
    
    switch(tab) {
      case "users": endpoint = "/api/admin/users"; break;
      case "posts": endpoint = "/api/posts"; break;
      case "jobs": endpoint = "/api/jobs?limit=1000"; break;
      case "market": endpoint = "/api/marketplace"; break;
      case "tutors": endpoint = "/api/tutors"; break;
      case "projects": endpoint = "/api/projects"; break;
      case "tournaments": endpoint = "/api/tournaments"; break;
      case "lost-found": endpoint = "/api/lost-found"; break;
      case "polls": endpoint = "/api/polls"; break;
    }

    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (tab === "jobs" && json.jobs) {
            setData(json.jobs);
          } else if (tab === "polls" && json.polls) {
            setData(json.polls);
          } else {
            setData(json);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: number | string, type: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    const token = localStorage.getItem("token");
    let endpoint = "";

    // Determine endpoint based on type/tab
    if (activeTab === 'users') endpoint = `/api/admin/users?id=${id}`;
    else if (activeTab === 'posts') endpoint = `/api/posts/${id}`;
    else if (activeTab === 'jobs') endpoint = `/api/jobs/${id}`;
    else if (activeTab === 'market') endpoint = `/api/marketplace/${id}`;
    else if (activeTab === 'tutors') endpoint = `/api/tutors/${id}`;
    else if (activeTab === 'projects') endpoint = `/api/projects/${id}`;
    else if (activeTab === 'tournaments') endpoint = `/api/tournaments/${id}`;
    else if (activeTab === 'lost-found') endpoint = `/api/lost-found/${id}`;
    else if (activeTab === 'polls') endpoint = `/api/polls/${id}`;

    if (endpoint) {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Deleted successfully");
        fetchData(activeTab); // Refresh
        fetchStats(); // Refresh stats
      } else {
        alert("Failed to delete");
      }
    }
  };

  const handleApprove = async (id: number, role: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, role }),
      });
      if (res.ok) {
        alert("User approved successfully");
        fetchData(activeTab);
      } else {
        alert("Failed to approve user");
      }
    } catch (e) {
      console.error(e);
      alert("Error approving user");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Admin Dashboard</h1>
      
      <StatCards stats={stats} />

      <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto flex justify-between items-center">
        <nav className="-mb-px flex space-x-8">
          {['users', 'posts', 'jobs', 'market', 'tutors', 'projects', 'tournaments', 'lost-found', 'polls'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium capitalize`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>
        {activeTab === 'polls' && (
          <button
            onClick={() => { setSelectedPoll(null); setIsPollModalOpen(true); }}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            + Create Poll
          </button>
        )}
      </div>

      <CreatePollModal 
        isOpen={isPollModalOpen} 
        onClose={() => { setIsPollModalOpen(false); setSelectedPoll(null); }} 
        onCreated={() => fetchData('polls')} 
        poll={selectedPoll}
      />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {activeTab === 'users' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Requested Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </>
                )}
                {activeTab === 'posts' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Content</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </>
                )}
                 {activeTab === 'jobs' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </>
                )}
                {activeTab === 'market' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </>
                )}
                {activeTab === 'tutors' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </>
                )}
                {activeTab === 'projects' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </>
                )}
                {activeTab === 'tournaments' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Organizer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </>
                )}
                {activeTab === 'lost-found' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </>
                )}
                {activeTab === 'polls' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((item) => (
                <tr key={item.id}>
                  {activeTab === 'users' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{item.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{item.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {item.requested_role && (
                           <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                             {item.requested_role}
                           </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        {item.requested_role && (
                          <button onClick={() => handleApprove(item.id, item.requested_role)} className="text-green-600 hover:text-green-900">Approve</button>
                        )}
                        <button onClick={() => handleDelete(item.id, 'user')} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </>
                  )}
                  {activeTab === 'posts' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white truncate max-w-xs">{item.content}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{item.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleDelete(item.id, 'post')} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </>
                  )}
                  {activeTab === 'jobs' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{item.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{item.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleDelete(item.id, 'job')} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </>
                  )}
                  {activeTab === 'market' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{item.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">${item.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{item.seller || item.sellerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleDelete(item.id, 'market')} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </>
                  )}
                  {activeTab === 'tutors' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{Array.isArray(item.subjects) ? item.subjects.join(', ') : item.subjects}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">${item.hourlyRate}/hr</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleDelete(item.id, 'tutor')} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </>
                  )}
                  {activeTab === 'projects' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{item.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{item.author_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{Array.isArray(item.tags) ? item.tags.join(', ') : ''}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleDelete(item.id, 'project')} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </>
                  )}
                  {activeTab === 'tournaments' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{item.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{item.organizer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{item.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleDelete(item.id, 'tournament')} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </>
                  )}
                  {activeTab === 'lost-found' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{item.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{item.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{item.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleDelete(item.id, 'lost-found')} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </>
                  )}
                  {activeTab === 'polls' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{item.id}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{item.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{item.created_by_name || 'Admin'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => { setSelectedPoll(item); setIsPollModalOpen(true); }} 
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item.id, 'polls')} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
