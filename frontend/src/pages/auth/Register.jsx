import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLE_DASHBOARD_MAP } from "../../utils/constants.js";
import { Input, Button, Card } from "../../components/common";

const checkPasswordStrength = (password) => {
  let score = 0;
  if (!password) return score;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&#^()_\-+=[\]{}|\\:;"'<>,.?/~`]/.test(password)) score += 1;
  return score; // Max 5
};

export default function Register() {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      rollNumber: "",
      department: "",
      year: "",
      hostel: "",
      roomNumber: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    setStrength(checkPasswordStrength(passwordValue));
  }, [passwordValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await registerAuth({
        name: data.name,
        email: data.email,
        rollNumber: data.rollNumber,
        department: data.department,
        year: data.year,
        hostel: data.hostel,
        roomNumber: data.roomNumber,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      toast.success(`Account created successfully! Welcome, ${user.name}`);
      const dashboardPath = ROLE_DASHBOARD_MAP[user.role] || "/";
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      const serverMessage =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <Card className="w-full max-w-2xl" padding="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-600 mb-4 shadow-sm">
            <span className="text-white font-bold text-lg">CR</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create student account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join CampusResolve to raise and track complaints</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="name"
              label="Full Name"
              placeholder="Arjun Sharma"
              error={errors.name?.message}
              {...register("name", { required: "Full name is required." })}
            />
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="arjun@campus.edu"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address.",
                },
              })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="rollNumber"
              label="Roll Number"
              placeholder="CS19B1001"
              error={errors.rollNumber?.message}
              {...register("rollNumber", { required: "Roll number is required." })}
            />
            <Input
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="9876543210"
              error={errors.phone?.message}
              {...register("phone", {
                required: "Phone number is required.",
                pattern: {
                  value: /^[0-9+\-\s()]{10,20}$/,
                  message: "Please enter a valid phone number.",
                },
              })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="department"
              label="Department"
              placeholder="Computer Science"
              error={errors.department?.message}
              {...register("department", { required: "Department is required." })}
            />
            <div className="space-y-1.5">
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Year of Study
              </label>
              <select
                id="year"
                className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                  errors.year ? "border-red-300 focus:ring-red-500" : "border-gray-300"
                }`}
                {...register("year", { required: "Year is required." })}
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              {errors.year && <p className="text-red-500 text-xs mt-1.5">{errors.year.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="hostel"
              label="Hostel"
              placeholder="Hostel Block A"
              error={errors.hostel?.message}
              {...register("hostel", { required: "Hostel is required." })}
            />
            <Input
              id="roomNumber"
              label="Room Number"
              placeholder="A-204"
              error={errors.roomNumber?.message}
              {...register("roomNumber", { required: "Room number is required." })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                    errors.password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
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
              
              {/* Strength Meter */}
              {passwordValue && (
                <div className="mt-2 flex gap-1 h-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full ${
                        i < strength 
                          ? strength < 3 ? 'bg-red-400' : strength < 5 ? 'bg-yellow-400' : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    ></div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <Input
              id="confirmPassword"
              label="Confirm Password"
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
          </div>

          <Button type="submit" isLoading={isSubmitting} fullWidth className="mt-4">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
