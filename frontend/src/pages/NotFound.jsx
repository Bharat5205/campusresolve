/**
 * pages/NotFound.jsx
 * -------------------
 * 404 page for undefined routes.
 */

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-bold text-brand-200">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mt-4">Page not found</h1>
      <p className="text-gray-500 mt-2 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-8">
        Go to Home
      </Link>
    </div>
  );
}
