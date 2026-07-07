import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { Input, Button, Card } from "../../components/common";

const CATEGORIES = ["Electrical", "Plumbing", "Sanitation", "Furniture", "Network", "Carpentry", "Civil", "Other"];

export default function StudentNewComplaint() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("location", data.location);
      
      if (data.images && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          formData.append("images", data.images[i]);
        }
      }

      await api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      toast.success("Complaint raised successfully.");
      navigate("/student/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to raise complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Raise a Complaint</h1>
        <p className="text-gray-500 mt-1">Provide details about the issue you are facing.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            id="title"
            label="Complaint Title"
            placeholder="e.g. Fan not working in Room 204"
            error={errors.title?.message}
            {...register("title", { required: "Title is required", minLength: { value: 10, message: "Title must be at least 10 characters long" } })}
          />

          <div className="space-y-1.5">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                errors.category ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300"
              }`}
              {...register("category", { required: "Category is required" })}
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1.5">{errors.category.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              className={`w-full px-3 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${
                errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300"
              }`}
              placeholder="Describe the issue in detail..."
              {...register("description", { required: "Description is required", minLength: { value: 20, message: "Please provide more details (at least 20 chars)" } })}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
          </div>

          <Input
            id="location"
            label="Location"
            placeholder="e.g. Block A - Room 204, Ground Floor Corridor"
            error={errors.location?.message}
            {...register("location", {
              required: "Location is required.",
              minLength: { value: 3, message: "Please provide a more specific location." },
            })}
          />

          <div className="space-y-1.5">
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
              Attach Images (Optional)
            </label>
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-colors"
              {...register("images")}
            />
            <p className="text-xs text-gray-500">You can upload up to 5 images (max 5MB each).</p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit Complaint
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
