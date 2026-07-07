export const Card = ({ children, className = "", padding = "p-6" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className={padding}>
        {children}
      </div>
    </div>
  );
};
