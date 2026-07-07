import { Link } from "react-router-dom";
import { Button } from "./Button.jsx";

export const EmptyState = ({ 
  title = "No data found", 
  description = "There is currently no data to display.", 
  actionText, 
  actionLink, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
      <div className="h-24 w-24 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      
      {actionText && (
        actionLink ? (
          <Link to={actionLink}>
            <Button variant="primary">{actionText}</Button>
          </Link>
        ) : (
          <Button variant="primary" onClick={onAction}>{actionText}</Button>
        )
      )}
    </div>
  );
};
