import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function WardenDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/warden/dashboard");
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
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const { kpis, charts, recentComplaints } = stats || {};

  const statCards = [
    { label: "Total Complaints", value: kpis?.total, color: "text-blue-600" },
    { label: "Pending", value: kpis?.pending, color: "text-yellow-600" },
    { label: "Assigned", value: kpis?.assigned, color: "text-indigo-600" },
    { label: "In Progress", value: kpis?.inProgress, color: "text-orange-600" },
    { label: "Resolved", value: kpis?.resolved, color: "text-green-600" },
    { label: "Closed", value: kpis?.closed, color: "text-gray-600" },
  ];

  const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280", "#EC4899"];

  const categoryData = {
    labels: charts?.categoryDistribution?.map(d => d.name) || [],
    datasets: [{
      data: charts?.categoryDistribution?.map(d => d.value) || [],
      backgroundColor: colors,
    }],
  };

  const statusData = {
    labels: charts?.statusDistribution?.map(d => d.name) || [],
    datasets: [{
      data: charts?.statusDistribution?.map(d => d.value) || [],
      backgroundColor: ["#F59E0B", "#4F46E5", "#EC4899", "#10B981", "#6B7280", "#EF4444"],
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };
  
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "right" } },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warden Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor complaints, assign maintenance staff, and track complaint resolution.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/warden/complaints" className="btn-primary">
            View All Complaints
          </Link>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card flex flex-col justify-between hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Status Distribution</h2>
          <div className="h-64"><Doughnut data={statusData} options={doughnutOptions} /></div>
        </div>
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          <div className="h-64"><Bar data={categoryData} options={chartOptions} /></div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Complaints</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Raised By</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hostel</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentComplaints?.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-sm text-gray-500">No recent complaints.</td>
                </tr>
              )}
              {recentComplaints?.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    <Link to={`/warden/complaints/${complaint.id}`} className="hover:text-brand-600 hover:underline">
                      {complaint.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{complaint.category}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      complaint.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      complaint.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                      complaint.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{complaint.student}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{complaint.hostel} - {complaint.roomNumber}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                    {format(new Date(complaint.createdAt), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
