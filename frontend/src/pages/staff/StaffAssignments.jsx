import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const CATEGORIES = ["Electrical", "Plumbing", "Sanitation", "Furniture", "Network", "Carpentry", "Civil", "Other"];
const STATUSES = ["ASSIGNED", "IN_PROGRESS", "RESOLVED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function StaffAssignments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);

  // Filters from URL or default
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [priority, setPriority] = useState(searchParams.get("priority") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, priority, category, sort]); 

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort };
      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;

      const { data } = await api.get("/staff/complaints", { params });
      setComplaints(data.data);
      setMeta(data.meta);
      
      // Update URL params
      setSearchParams(params, { replace: true });
    } catch {
      toast.error("Failed to fetch assigned complaints.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const getStatusColor = (s) => {
    switch (s) {
      case "ASSIGNED": return "bg-indigo-100 text-indigo-800";
      case "IN_PROGRESS": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "CRITICAL": return "text-red-600 font-bold";
      case "HIGH": return "text-orange-600 font-semibold";
      case "MEDIUM": return "text-yellow-600 font-medium";
      case "LOW": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-500 mt-1">Manage and update progress on your assignments.</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search by Ticket ID or Student Name..."
              className="input-field flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn-secondary whitespace-nowrap">Search</button>
          </form>

          <div className="flex gap-2 flex-wrap">
            <select className="input-field w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            <select className="input-field w-auto" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="input-field w-auto" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input-field w-auto bg-gray-50" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm font-semibold text-gray-500 bg-gray-50">
                <th className="p-3 rounded-tl-lg">Ticket ID</th>
                <th className="p-3">Student</th>
                <th className="p-3">Hostel & Room</th>
                <th className="p-3">Category</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Date</th>
                <th className="p-3 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-gray-400">Loading complaints...</td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-gray-400">No assigned complaints found.</td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-3 text-sm font-medium text-gray-900">
                      <Link to={`/staff/complaints/${c.id}`} className="hover:text-brand-600 transition-colors">
                        #{c.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{c.raisedBy?.name}</td>
                    <td className="p-3 text-sm text-gray-600">{c.raisedBy?.hostel || "-"} - {c.raisedBy?.roomNumber || "-"}</td>
                    <td className="p-3 text-sm text-gray-600">{c.category}</td>
                    <td className={`p-3 text-sm ${getPriorityColor(c.priority)}`}>{c.priority}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(c.status)}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-500">{c.assignedAt ? format(new Date(c.assignedAt), "MMM d, yyyy") : "-"}</td>
                    <td className="p-3 text-sm">
                      <Link to={`/staff/complaints/${c.id}`} className="text-brand-600 hover:text-brand-800 font-medium">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Showing page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button className="btn-secondary px-3 py-1 text-sm" disabled={meta.page === 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </button>
              <button className="btn-secondary px-3 py-1 text-sm" disabled={meta.page === meta.totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
