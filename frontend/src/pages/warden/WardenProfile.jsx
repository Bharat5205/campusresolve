import { useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function WardenProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    department: user?.department || "",
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/users/me", formData);
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Update your personal details and security settings.</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Read Only)</label>
              <input 
                type="email" 
                className="input-field bg-gray-50 text-gray-500" 
                value={user?.email || ""}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                className="input-field" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button type="submit" className="btn-primary" disabled={loading}>Save Changes</button>
          </div>
        </form>
      </div>

    </div>
  );
}
