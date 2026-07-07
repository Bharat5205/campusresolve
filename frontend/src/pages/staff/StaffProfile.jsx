import { useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function StaffProfile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const [profileImage, setProfileImage] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      await api.patch("/users/me", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("Profile updated successfully.");
      if (refreshUser) refreshUser();
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
        <p className="text-gray-500 mt-1">Update your contact information and profile picture.</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
          <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex-shrink-0">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-bold text-gray-400 text-xl">
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Profile Picture</p>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>
        </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Department (Read Only)</label>
              <input 
                type="text" 
                className="input-field bg-gray-50 text-gray-500" 
                value={user?.department || ""}
                disabled
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
