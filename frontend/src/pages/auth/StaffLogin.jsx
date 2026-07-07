import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLE_DASHBOARD_MAP } from "../../utils/constants.js";
import { Input, Button, Card } from "../../components/common";

export default function StaffLogin() {
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

      if (user.role !== "STAFF") {
        toast.error("This portal is for maintenance staff only.");
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
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-orange-500 mb-4 shadow-sm">
            <span className="text-white font-bold text-lg">CR</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Staff Portal</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your CampusResolve account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="email"
            label="Official Email address"
            type="email"
            placeholder="staff@campus.edu"
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
        </form>
      </Card>
    </div>
  );
}
