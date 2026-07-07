import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLE_DASHBOARD_MAP } from "../../utils/constants.js";
import { Input, Button, Card } from "../../components/common";

export default function StudentLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (user.role !== "STUDENT") {
        toast.error("This portal is for students only.");
        return;
      }

      toast.success(`Welcome back, ${user.name}!`);
      const defaultDashboard = ROLE_DASHBOARD_MAP[user.role] || "/";
      navigate(from || defaultDashboard, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="w-full max-w-md" padding="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-600 mb-4 shadow-sm">
            <span className="text-white font-bold text-lg">CR</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your CampusResolve account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="you@campus.edu"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address.",
              },
            })}
          />

          <div>
            <div className="mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                  errors.password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
                }`}
                {...register("password", { required: "Password is required." })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded cursor-pointer"
                {...register("rememberMe")}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-xs text-gray-700 cursor-pointer select-none">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Sign In
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400">or</span>
            </div>
          </div>

          <a
            href="/api/auth/google"
            className="btn-secondary w-full py-2 flex items-center justify-center gap-2.5 text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors border border-gray-300 rounded-lg"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </a>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium transition-colors">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
