import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

export default function StaffComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Action states
  const [isAccepting, setIsAccepting] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  // Form states
  const [progressMessage, setProgressMessage] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionFile, setResolutionFile] = useState(null);
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    fetchComplaint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const { data } = await api.get(`/staff/complaints/${id}`);
      setComplaint(data.data);
    } catch {
      toast.error("Failed to fetch complaint details.");
      navigate("/staff/assigned");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await api.put(`/staff/complaints/${id}/accept`);
      toast.success("Complaint accepted. Work started!");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept complaint.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!progressMessage.trim()) return toast.error("Progress message cannot be empty.");
    setIsUpdatingProgress(true);
    try {
      await api.put(`/staff/complaints/${id}/progress`, { progressMessage });
      toast.success("Progress updated successfully.");
      setProgressMessage("");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update progress.");
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) return toast.error("Resolution notes are required.");
    
    setIsResolving(true);
    try {
      const formData = new FormData();
      formData.append("resolutionNotes", resolutionNotes);
      if (resolutionFile) {
        formData.append("resolutionImage", resolutionFile);
      }

      await api.put(`/staff/complaints/${id}/resolve`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Complaint marked as resolved!");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resolve complaint.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return toast.error("Comment cannot be empty.");
    setIsCommenting(true);
    try {
      await api.post(`/complaints/${id}/comments`, { content: commentContent });
      toast.success("Comment added.");
      setCommentContent("");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment.");
    } finally {
      setIsCommenting(false);
    }
  };

  if (loading || !complaint) return <div className="p-12 text-center text-gray-500 animate-pulse">Loading details...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Complaint #{complaint.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-500 mt-1">Assigned on {complaint.assignedAt ? format(new Date(complaint.assignedAt), "PPP 'at' p") : "-"}</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-semibold">{complaint.category}</span>
          <span className={`px-3 py-1 rounded-lg text-sm font-semibold 
            ${complaint.status === "ASSIGNED" ? "bg-indigo-100 text-indigo-800" : 
              complaint.status === "IN_PROGRESS" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}>
            {complaint.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Timeline */}
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
                      <span className="text-xs font-bold">CR</span>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-gray-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900 text-sm">{history.action.replace("_", " ")}</span>
                        <time className="text-xs text-gray-500">{format(new Date(history.createdAt), "MMM d, h:mm a")}</time>
                      </div>
                      {history.oldValue && history.newValue && (
                        <p className="text-sm text-gray-600">
                          {history.oldValue} → {history.newValue}
                        </p>
                      )}
                      {history.reason && <p className="text-xs text-gray-500 mt-1 italic">"{history.reason}"</p>}
                      <p className="text-xs text-brand-600 mt-2">by {history.actor?.name} ({history.actor?.role})</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Comments</h2>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
              {complaint.comments?.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet.</p>
              ) : (
                complaint.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {c.author.profileImage ? (
                        <img src={c.author.profileImage} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                      ) : c.author.name.charAt(0)}
                    </div>
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg rounded-tl-none">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-semibold text-gray-900">{c.author.name} <span className="text-xs font-normal text-gray-500">({c.author.role})</span></span>
                        <span className="text-xs text-gray-400">{format(new Date(c.createdAt), "MMM d, h:mm a")}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                className="input-field flex-1"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                disabled={isCommenting}
              />
              <button type="submit" className="btn-secondary" disabled={isCommenting || !commentContent.trim()}>
                Post
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Actions & Meta */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-3">Student & Location Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500 block text-xs">Student Name</span> {complaint.raisedBy?.name}</p>
              <p><span className="text-gray-500 block text-xs">Contact Number</span> {complaint.raisedBy?.phone || "Not provided"}</p>
              <p><span className="text-gray-500 block text-xs">Hostel & Room</span> {complaint.raisedBy?.hostel || "-"} - {complaint.raisedBy?.roomNumber || "-"}</p>
              <p><span className="text-gray-500 block text-xs">Exact Location</span> {complaint.location}</p>
            </div>
          </div>

          {/* Action: Accept Complaint */}
          {complaint.status === "ASSIGNED" && (
            <div className="card bg-indigo-50/50 border border-indigo-100">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3">Accept Assignment</h3>
              <p className="text-sm text-indigo-700 mb-4">Accepting this complaint notifies the student and warden that you are beginning work.</p>
              <button 
                onClick={handleAccept} 
                disabled={isAccepting}
                className="btn-primary w-full bg-indigo-600 hover:bg-indigo-700 ring-indigo-600"
              >
                {isAccepting ? "Accepting..." : "Accept & Start Work"}
              </button>
            </div>
          )}

          {/* Actions: Update Progress & Resolve */}
          {complaint.status === "IN_PROGRESS" && (
            <>
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Progress</h3>
                <form onSubmit={handleUpdateProgress} className="space-y-3">
                  <textarea 
                    placeholder="E.g., Visited room, waiting for parts..." 
                    className="input-field text-sm" 
                    rows="2"
                    value={progressMessage}
                    onChange={(e) => setProgressMessage(e.target.value)}
                  />
                  <button type="submit" className="btn-secondary w-full" disabled={isUpdatingProgress}>
                    Update Progress
                  </button>
                </form>
              </div>

              <div className="card border-green-200 bg-green-50/50">
                <h3 className="text-sm font-semibold text-green-900 mb-3">Mark as Resolved</h3>
                <form onSubmit={handleResolve} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">Resolution Notes (Required)</label>
                    <textarea 
                      placeholder="Describe what was fixed..." 
                      className="input-field bg-white border-green-200 text-sm" 
                      rows="3"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">Resolution Image (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/jpg"
                      onChange={(e) => setResolutionFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full bg-green-600 hover:bg-green-700 ring-green-600" disabled={isResolving}>
                    {isResolving ? "Resolving..." : "Mark Resolved"}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* Resolution Details if resolved */}
          {(complaint.status === "RESOLVED" || complaint.status === "CLOSED") && (
            <div className="card bg-gray-50 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Resolution Details</h3>
              <div className="space-y-3 text-sm">
                <p><span className="text-gray-500 block text-xs">Resolved At</span> {complaint.resolvedAt ? format(new Date(complaint.resolvedAt), "PPP 'at' p") : "-"}</p>
                <p><span className="text-gray-500 block text-xs">Resolution Notes</span> {complaint.resolutionNotes || "-"}</p>
                {complaint.resolutionImage && (
                  <div>
                    <span className="text-gray-500 block text-xs mb-1">Proof of Work</span>
                    <a href={complaint.resolutionImage} target="_blank" rel="noreferrer">
                      <img src={complaint.resolutionImage} alt="Resolution" className="h-24 w-24 object-cover rounded border border-gray-300 hover:opacity-90" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
