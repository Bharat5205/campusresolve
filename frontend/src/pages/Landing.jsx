import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">CR</span>
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">
                CampusResolve
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-16">
        
        {/* Hero Section */}
        <section id="home" className="relative overflow-hidden bg-white pt-24 pb-20">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-200/50 blur-3xl opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-200/50 blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
              CampusResolve <br className="hidden md:block"/>
              <span className="text-brand-600">Smart Campus Complaint Management</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Streamline maintenance, empower students, and optimize campus operations with a unified, intelligent ticketing system.
            </p>
          </div>
        </section>

        {/* Portals Section */}
        <section id="portals" className="py-24 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Choose Your Portal</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Select your role to access the CampusResolve system and manage your tasks efficiently.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Student Portal Card */}
              <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col focus-within:ring-2 focus-within:ring-purple-500">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-2xl"></div>
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  🎓
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Student Portal</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  Raise complaints, track status, and receive real-time notifications.
                </p>
                <div className="flex flex-col gap-3 mt-auto">
                  <Link to="/login" className="w-full focus:outline-none">
                    <button className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border-2 border-transparent text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none" aria-label="Student Login">
                      Login
                    </button>
                  </Link>
                </div>
              </div>

              {/* Warden Portal Card */}
              <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col focus-within:ring-2 focus-within:ring-indigo-500">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-800 to-indigo-900 rounded-t-2xl"></div>
                <div className="w-16 h-16 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  🛡️
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Warden Portal</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  Manage complaints, assign staff, and monitor campus analytics.
                </p>
                <div className="flex flex-col gap-3 mt-auto">
                  <Link to="/warden-login" className="w-full focus:outline-none">
                    <button className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border-2 border-transparent text-white bg-indigo-700 hover:bg-indigo-800 transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none" aria-label="Warden Login">
                      Login
                    </button>
                  </Link>
                </div>
              </div>

              {/* Maintenance Staff Portal Card */}
              <div className="group relative bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col focus-within:ring-2 focus-within:ring-orange-500">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-t-2xl"></div>
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  🔧
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Maintenance Staff Portal</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  View assigned complaints, update progress, and resolve issues.
                </p>
                <div className="flex flex-col gap-3 mt-auto">
                  <Link to="/staff-login" className="w-full focus:outline-none">
                    <button className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border-2 border-transparent text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none" aria-label="Maintenance Staff Login">
                      Login
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">CR</span>
              </div>
              <span className="text-lg font-bold text-white">CampusResolve</span>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} CampusResolve. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
