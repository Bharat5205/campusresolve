import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { DataTable, Button, Modal, Input, Card } from "../../components/common";

export default function WardenStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Electrical",
    password: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/warden/staff");
      setStaff(data.data || []);
    } catch {
      toast.error("Failed to fetch staff.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone || "",
        department: staffMember.department || "Electrical",
        password: "", 
      });
    } else {
      setEditingStaff(null);
      setFormData({ name: "", email: "", phone: "", department: "Electrical", password: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.put(`/warden/staff/${editingStaff.id}`, {
          phone: formData.phone,
          department: formData.department,
        });
        toast.success("Staff updated successfully.");
      } else {
        await api.post("/warden/staff", formData);
        toast.success("Staff created successfully. Welcome email sent.");
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  const toggleStatus = async (staffId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this staff member?`)) return;
    try {
      await api.put(`/warden/staff/${staffId}/deactivate`, { isActive: !currentStatus });
      toast.success(`Staff ${!currentStatus ? "activated" : "deactivated"}.`);
      fetchStaff();
    } catch {
      toast.error("Failed to change status.");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shadow-sm">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: "department", header: "Department", sortable: true },
    { key: "phone", header: "Contact", sortable: false, render: (row) => row.phone || "-" },
    {
      key: "performance",
      header: "Performance",
      sortable: false,
      render: (row) => (
        <div className="text-xs">
          <p><span className="text-gray-500">Assigned:</span> {row.stats?.assigned}</p>
          <p><span className="text-green-600 font-medium">Completed: {row.stats?.completed}</span></p>
          <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${row.stats?.completionRate || 0}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (row) => (
        <div className="space-x-3">
          <button onClick={() => openModal(row)} className="text-sm text-brand-600 hover:text-brand-800 font-medium">
            Edit
          </button>
          <button 
            onClick={() => toggleStatus(row.id, row.isActive)} 
            className={`text-sm font-medium ${row.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
          >
            {row.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage maintenance personnel and track performance.</p>
        </div>
        <Button onClick={() => openModal()}>
          + Add New Staff
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={staff}
          isLoading={loading}
          searchable={true}
          searchPlaceholder="Search staff by name or email..."
          searchKey={["name", "email", "department"]}
          emptyStateTitle="No staff found"
          emptyStateDesc="Add new staff members to assign complaints."
        />
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingStaff ? "Edit Staff" : "Add New Staff"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <Input 
            label="Full Name"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            disabled={!!editingStaff}
            required
          />
          <Input 
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            disabled={!!editingStaff}
            required
          />
          <Input 
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select 
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              value={formData.department}
              onChange={e => setFormData({...formData, department: e.target.value})}
              required
            >
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Network">Network</option>
              <option value="Civil">Civil</option>
            </select>
          </div>

          {!editingStaff && (
            <div>
              <Input 
                label="Temporary Password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
              <p className="text-xs text-gray-500 mt-1">This will be emailed to the staff member.</p>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" fullWidth>{editingStaff ? "Save Changes" : "Create Account"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
