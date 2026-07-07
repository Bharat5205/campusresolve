import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { Input, Button, Card } from "../../components/common";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data) => {
    if (!email || !otp) {
      toast.error("Session expired. Please restart the reset process.");
      navigate("/forgot-password");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword: data.password,
      });
      toast.success("Password reset successfully. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="w-full max-w-md" padding="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-100 text-brand-600 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter your new secure password</p>
        </div>

        {!email ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">Missing email session. Please restart.</p>
            <Link to="/forgot-password">
              <Button fullWidth>Go to Forgot Password</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                    errors.password ? "border-red-300 focus:ring-red-500" : "border-gray-300"
                  }`}
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters.",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=[\]{}|\\:;"'<>,.?/~`]).*$/,
                      message: "Password must contain uppercase, lowercase, number and special character.",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: "Confirm password is required.",
                validate: (val) => {
                  if (val !== watch("password")) {
                    return "Passwords do not match.";
                  }
                },
              })}
            />

            <Button type="submit" isLoading={isSubmitting} fullWidth className="mt-4">
              Reset Password
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
