import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyOtp } from "../../services/auth.service.js";
import { useState, useEffect } from "react";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email is passed via navigation state from ForgotPassword
  const email = location.state?.email || "";

  // Guard: if no email, redirect back to forgot-password
  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please enter your email again.");
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await verifyOtp({ email: data.email || email, otp: data.otp });
      toast.success("OTP verified successfully!");
      // Pass email and otp via state (not URL) to keep OTP off browser history
      navigate("/reset-password", {
        state: { email: data.email || email, otp: data.otp },
        replace: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md shadow-md bg-white border border-gray-100 rounded-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-600 mb-4 shadow-sm">
            <span className="text-white font-bold text-lg">CR</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Please enter the 6-digit verification code sent to <br />
            <strong className="text-gray-700">{email || "your email"}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field — hidden or readonly depending on query param presence */}
          {!email && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@campus.edu"
                className={`input-field ${errors.email ? "input-error" : ""}`}
                {...register("email", { required: "Email is required to match OTP." })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1.5">
              OTP Code
            </label>
            <input
              id="otp"
              type="text"
              maxLength="6"
              placeholder="123456"
              className={`input-field text-center text-lg tracking-widest font-semibold ${
                errors.otp ? "input-error" : ""
              }`}
              {...register("otp", {
                required: "OTP is required.",
                pattern: {
                  value: /^\d{6}$/,
                  message: "OTP must be exactly 6 digits.",
                },
              })}
            />
            {errors.otp && (
              <p className="text-red-500 text-xs mt-1.5" role="alert">
                {errors.otp.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5 shadow-sm text-sm font-medium transition-all"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Didn't receive code?{" "}
          <Link
            to="/forgot-password"
            className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            Resend OTP
          </Link>
        </p>
      </div>
    </div>
  );
}
