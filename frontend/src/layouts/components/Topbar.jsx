import { useAuth } from "../../context/AuthContext.jsx";
import NotificationCenter from "../../components/NotificationCenter.jsx";
import { Badge } from "../../components/common/Badge.jsx";

export const Topbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-30 relative">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-md hover:bg-gray-100"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
          {user?.role === "STUDENT" && "Student Dashboard"}
          {user?.role === "WARDEN" && "Warden Console"}
          {user?.role === "STAFF" && "Staff Console"}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationCenter />
        <div className="hidden sm:block h-6 w-px bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <Badge type="role" value={user?.role} className="bg-brand-50 text-brand-700" />
        </div>
      </div>
    </header>
  );
};
