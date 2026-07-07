import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { Card, SkeletonLoader, Button } from "../../components/common";

export default function StaffDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/staff/dashboard");
        setStats(data.data);
      } catch {
        toast.error("Failed to fetch dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="detail" />
        <SkeletonLoader type="card" count={5} />
      </div>
    );
  }

  const statCards = [
    { label: "Assigned Today", value: stats?.assignedToday, color: "text-blue-600" },
    { label: "Pending Acceptance", value: stats?.pending, color: "text-yellow-600" },
    { label: "In Progress", value: stats?.inProgress, color: "text-orange-600" },
    { label: "Resolved Today", value: stats?.resolvedToday, color: "text-green-600" },
    { label: "Total Completed", value: stats?.totalCompleted, color: "text-indigo-600" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your assigned tasks and performance.</p>
        </div>
        <Link to="/staff/assignments">
          <Button variant="primary">
            View Assignments
          </Button>
        </Link>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value ?? 0}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
