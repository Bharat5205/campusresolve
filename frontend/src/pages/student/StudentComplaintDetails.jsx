import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { Card, Badge, SkeletonLoader, EmptyState, Button, ConfirmDialog } from "../../components/common";
import { useAuth } from "../../context/AuthContext";

export default function StudentComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchComplaintData();
  }, [id]); // fetchComplaintData doesn't change, we just omit it or can wrap it in useCallback, but it's safe to just ignore the warning or use useCallback. Let's suppress the warning.
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const fetchComplaintData = async () => {
    setIsLoading(true);
    try {
      const [compRes, comRes] = await Promise.all([
        api.get(`/complaints/${id}`),
        api.get(`/complaints/${id}/comments`)
      ]);
      setComplaint(compRes.data.data);
      setComments(comRes.data.data || []);
    } catch {
      toast.error("Failed to fetch details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/complaints/${id}`);
      toast.success("Complaint deleted successfully.");
      window.history.back();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await api.post(`/complaints/${id}/comments`, { content: newComment });
      setNewComment("");
      const comRes = await api.get(`/complaints/${id}/comments`);
      setComments(comRes.data.data || []);
      toast.success("Comment added.");
    } catch {
      toast.error("Failed to add comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoader type="detail" />;
  }

  if (!complaint) {
    return <EmptyState title="Not Found" description="This complaint does not exist or you don't have access." actionText="Back to Dashboard" actionLink="/student/dashboard" />;
  }

  const canDelete = complaint.status === "PENDING";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">#{complaint.id.slice(0, 8).toUpperCase()}</h1>
            <Badge type="status" value={complaint.status} />
            <Badge type="priority" value={complaint.priority} />
            {complaint.isReopened && (
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full uppercase">Reopened</span>
            )}
          </div>
          <p className="text-gray-500 text-sm">Raised on {new Date(complaint.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          {canDelete && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete Ticket
            </Button>
          )}
          <Button variant="secondary" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{complaint.title}</h2>
            <div className="prose prose-sm text-gray-600 max-w-none whitespace-pre-wrap mb-6">
              {complaint.description}
            </div>

            {complaint.images && complaint.images.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Attachments</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.images.map((img, i) => (
                    <a key={i} href={img.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-video rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={img.url} alt="Attachment" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Comments Section */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Comments & Updates</h3>
            
            <div className="space-y-6 mb-6">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">No comments yet.</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className={`flex gap-4 ${c.author.id === user.id ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-xs">
                      {c.author.name.charAt(0)}
                    </div>
                    <div className={`flex-1 rounded-xl p-4 text-sm ${c.author.id === user.id ? 'bg-brand-50 text-brand-900' : 'bg-gray-50 text-gray-800'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{c.author.name}</span>
                        <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-3">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-500 focus:border-brand-500 outline-none"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button type="submit" disabled={!newComment.trim()} isLoading={isSubmittingComment}>
                Post
              </Button>
            </form>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card padding="p-5">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Ticket Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="text-sm font-medium text-gray-900">{complaint.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Hostel / Room</p>
                <p className="text-sm font-medium text-gray-900">{complaint.raisedBy.hostel} - {complaint.raisedBy.roomNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">{new Date(complaint.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card padding="p-5">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Assigned To</h3>
            {complaint.assignedTo ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {complaint.assignedTo.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{complaint.assignedTo.name}</p>
                  <p className="text-xs text-gray-500">{complaint.assignedTo.department} Staff</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Not assigned yet.</p>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Complaint"
        message="Are you sure you want to delete this ticket? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
