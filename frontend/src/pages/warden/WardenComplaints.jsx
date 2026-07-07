import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { DataTable, Badge, Card } from "../../components/common";

const CATEGORIES = ["Electrical", "Plumbing", "Sanitation", "Furniture", "Network", "Carpentry", "Civil", "Other"];
const STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function WardenComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority, category]); 

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;

      // Note: We use client-side pagination with the DataTable component
      // so we request all matching complaints for these filters (or up to a high limit)
      // The API currently has pagination, we'll fetch up to 100 for the warden dashboard
      params.limit = 100;

      const { data } = await api.get("/warden/complaints", { params });
      setComplaints(data.data || []);
    } catch {
      toast.error("Failed to fetch complaints.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "id",
      header: "Ticket ID",
      sortable: false,
      render: (row) => (
        <span className="font-medium text-gray-900">
          #{row.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "student",
      header: "Student",
      sortable: true,
      render: (row) => row.raisedBy?.name || "Unknown",
    },
    {
      key: "hostel",
      header: "Hostel",
      sortable: true,
      render: (row) => row.raisedBy?.hostel || "-",
    },
    { key: "category", header: "Category", sortable: true },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (row) => <Badge type="priority" value={row.priority} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge type="status" value={row.status} />
          {row.isReopened && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Reopened</span>}
        </div>
      ),
    },
    {
      key: "assignedStaff",
      header: "Assigned Staff",
      sortable: false,
      render: (row) => row.assignedTo ? row.assignedTo.name : <span className="text-gray-400 italic">Unassigned</span>,
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (row) => (
        <Link to={`/warden/complaints/${row.id}`} className="text-brand-600 hover:text-brand-800 font-medium text-sm">
          Manage
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
        <p className="text-gray-500 mt-1">View, filter, and assign complaints.</p>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2 flex-wrap">
            <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={complaints}
          isLoading={loading}
          searchable={true}
          searchPlaceholder="Search by ID, Title, or Student..."
          searchKey={["title", "id", "studentName"]} 
        />
      </Card>
    </div>
  );
}
