import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getInitials } from "../../utils/formatters.js";

const studentLinks = [
  { path: "/student/dashboard", label: "Dashboard", icon: "📊" },
];

const wardenLinks = [
  { path: "/warden/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/warden/complaints", label: "Complaints", icon: "📋" },
  { path: "/warden/staff", label: "Staff", icon: "👥" },
  { path: "/warden/notifications", label: "Notifications", icon: "🔔" },
  { path: "/warden/profile", label: "Profile", icon: "👤" },
];

const staffLinks = [
  { path: "/staff/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/staff/assignments", label: "Assignments", icon: "📋" },
  { path: "/staff/notifications", label: "Notifications", icon: "🔔" },
  { path: "/staff/profile", label: "Profile", icon: "👤" },
];

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const getLinks = () => {
    switch (user?.role) {
      case "STUDENT": return studentLinks;
      case "WARDEN": return wardenLinks;
      case "STAFF": return staffLinks;
      default: return [];
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transform transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Top Header */}
        <div>
          <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">CR</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">CampusResolve</span>
            </div>
            <button 
              className="lg:hidden text-gray-400 hover:text-gray-500"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="p-4 space-y-1" aria-label="Sidebar navigation">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3 mt-2">
              Main Menu
            </div>
            {getLinks().map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User profile section */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="h-10 w-10 rounded-full border border-gray-200 object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm border border-brand-200">
                {getInitials(user?.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
