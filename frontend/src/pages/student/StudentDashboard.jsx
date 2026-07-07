import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { Card, DataTable, Badge, Button } from "../../components/common";

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/complaints");
      // The API returns { data: [...], meta: {...} }
      setComplaints(data.data || []);
    } catch {
      toast.error("Failed to fetch complaints.");
    } finally {
      setIsLoading(false);
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
    { key: "category", header: "Category", sortable: true },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (row) => (
        <div className="max-w-xs truncate" title={row.title}>
          {row.title}
        </div>
      ),
    },
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
      render: (row) => <Badge type="status" value={row.status} />,
    },
    {
      key: "createdAt",
      header: "Date Raised",
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (row) => (
        <Link to={`/student/complaints/${row.id}`} className="text-brand-600 hover:text-brand-800 font-medium text-sm">
          View Details
        </Link>
      ),
    },
  ];

  const pendingCount = complaints.filter((c) => c.status === "PENDING" || c.status === "ASSIGNED").length;
  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Track and manage your complaints.</p>
        </div>
        <Link to="/student/complaints/new">
          <Button variant="primary" className="shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Raise Complaint
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Complaints", value: complaints.length },
          { label: "Pending", value: pendingCount },
          { label: "In Progress", value: inProgressCount },
          { label: "Resolved", value: resolvedCount },
        ].map((stat, idx) => (
          <Card key={idx} padding="p-5">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {isLoading ? "-" : stat.value}
            </p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Complaints</h2>
        <DataTable
          columns={columns}
          data={complaints}
          isLoading={isLoading}
          searchable={true}
          searchPlaceholder="Search complaints..."
          searchKey={["title", "id", "category"]}
          emptyStateTitle="No complaints found"
          emptyStateDesc="You haven't raised any complaints yet."
        />
      </div>
    </div>
  );
}
