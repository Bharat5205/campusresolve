const statusVariants = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ASSIGNED: "bg-indigo-100 text-indigo-800",
  IN_PROGRESS: "bg-pink-100 text-pink-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const priorityVariants = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

export const Badge = ({ type = "status", value, className = "" }) => {
  if (!value) return null;
  const uppercaseValue = value.toUpperCase();
  const variants = type === "status" ? statusVariants : priorityVariants;
  const colorClass = variants[uppercaseValue] || "bg-gray-100 text-gray-800";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${colorClass} ${className}`}>
      {uppercaseValue.replace("_", " ")}
    </span>
  );
};
