import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS", "CLOSED"]; // Excludes RESOLVED (only staff)
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function WardenComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Action states
  const [assigning, setAssigning] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchComplaint();
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const { data } = await api.get(`/warden/complaints/${id}`);
      setComplaint(data.data);
      setSelectedStatus(data.data.status === "RESOLVED" ? "CLOSED" : data.data.status); // Default for status update
      setSelectedPriority(data.data.priority);
    } catch {
      toast.error("Failed to fetch complaint details.");
      navigate("/warden/complaints");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data } = await api.get("/warden/staff?limit=100");
      setStaffList(data.data.filter(s => s.isActive));
    } catch {
      // Ignore failure, dropdown will be empty
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return toast.error("Please select a staff member.");
    
    setAssigning(true);
    try {
      await api.put(`/warden/complaints/${id}/assign`, { staffId: selectedStaff });
      toast.success("Staff assigned successfully.");
      setSelectedStaff("");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign staff.");
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/warden/complaints/${id}/status`, { status: selectedStatus, remarks: statusRemarks });
      toast.success("Status updated successfully.");
      setStatusRemarks("");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/warden/complaints/${id}/priority`, { priority: selectedPriority });
      toast.success("Priority updated.");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update priority.");
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason) return toast.error("Cancellation reason is required.");
    
    if (!window.confirm("Are you sure you want to cancel this complaint?")) return;

    try {
      await api.put(`/warden/complaints/${id}/cancel`, { reason: cancelReason });
      toast.success("Complaint cancelled.");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel complaint.");
    }
  };

  if (loading || !complaint) return <div className="p-12 text-center text-gray-500 animate-pulse">Loading details...</div>;

  const isResolvedOrClosed = complaint.status === "RESOLVED" || complaint.status === "CLOSED" || complaint.status === "CANCELLED";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Complaint #{complaint.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-500 mt-1">Submitted on {format(new Date(complaint.createdAt), "PPP 'at' p")}</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-semibold">{complaint.category}</span>
          <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-semibold">{complaint.status}</span>
        </div>
      </div>

      {complaint.isReopened && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <p className="text-sm text-red-800 font-semibold">⚠️ This complaint was REOPENED.</p>
          {complaint.reopenReason && <p className="text-sm text-red-700 mt-1">Reason: {complaint.reopenReason}</p>}
        </div>
      )}

      {complaint.status === "CANCELLED" && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <p className="text-sm text-red-800 font-semibold">🚫 This complaint was CANCELLED.</p>
          {complaint.cancelReason && <p className="text-sm text-red-700 mt-1">Reason: {complaint.cancelReason}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{complaint.title}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
            
            {complaint.images?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Attached Images</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {complaint.images.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noreferrer" className="flex-shrink-0">
                      <img src={img} alt="Complaint" className="h-32 w-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity History */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Activity Timeline</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {complaint.histories?.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No activity recorded yet.</p>
              ) : (
                complaint.histories.map((history) => (
                  <div key={history.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-gray-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900 text-sm">{history.action.replace("_", " ")}</span>
                        <time className="text-xs text-gray-500">{format(new Date(history.createdAt), "MMM d, h:mm a")}</time>
                      </div>
                      <p className="text-sm text-gray-600">
                        {history.oldValue} → {history.newValue}
                      </p>
                      {history.reason && <p className="text-xs text-gray-500 mt-1 italic">"{history.reason}"</p>}
                      <p className="text-xs text-brand-600 mt-2">by {history.actor?.name} ({history.actor?.role})</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Meta */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-3">Student Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500 block text-xs">Name</span> {complaint.raisedBy?.name}</p>
              <p><span className="text-gray-500 block text-xs">Email</span> {complaint.raisedBy?.email}</p>
              <p><span className="text-gray-500 block text-xs">Hostel & Room</span> {complaint.raisedBy?.hostel || "-"} - {complaint.raisedBy?.roomNumber || "-"}</p>
              <p><span className="text-gray-500 block text-xs">Location</span> {complaint.location}</p>
            </div>
          </div>

          {/* Action: Assign Staff */}
          <div className="card bg-indigo-50/50 border border-indigo-100">
            <h3 className="text-sm font-semibold text-indigo-900 mb-3">Assign Staff</h3>
            {complaint.assignedTo ? (
              <div className="text-sm bg-white p-3 rounded-lg border border-indigo-100 mb-4">
                <p className="font-medium text-gray-900">{complaint.assignedTo.name}</p>
                <p className="text-gray-500 text-xs">{complaint.assignedTo.department}</p>
              </div>
            ) : null}
            
            {!isResolvedOrClosed && (
              <form onSubmit={handleAssign} className="space-y-3">
                <select 
                  className="input-field bg-white" 
                  value={selectedStaff} 
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  disabled={assigning}
                >
                  <option value="">Select Staff...</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                  ))}
                </select>
                <button type="submit" className="btn-primary w-full" disabled={assigning || !selectedStaff}>
                  {complaint.assignedTo ? "Reassign Staff" : "Assign Staff"}
                </button>
              </form>
            )}
          </div>

          {/* Action: Update Status & Priority */}
          {!isResolvedOrClosed && (
            <>
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h3>
                <form onSubmit={handleStatusUpdate} className="space-y-3">
                  <select className="input-field" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <textarea 
                    placeholder="Optional remarks..." 
                    className="input-field text-sm" 
                    rows="2"
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                  />
                  <button type="submit" className="btn-secondary w-full" disabled={updating}>Update Status</button>
                </form>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Priority</h3>
                <form onSubmit={handlePriorityUpdate} className="flex gap-2">
                  <select className="input-field flex-1" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button type="submit" className="btn-secondary whitespace-nowrap">Save</button>
                </form>
              </div>

              <div className="card border-red-200 bg-red-50">
                <h3 className="text-sm font-semibold text-red-900 mb-3">Cancel Complaint</h3>
                <form onSubmit={handleCancel} className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Reason for cancellation..." 
                    className="input-field bg-white border-red-200"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <button type="submit" className="w-full btn-primary bg-red-600 hover:bg-red-700 ring-red-600">
                    Cancel Complaint
                  </button>
                </form>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
