import React from 'react';

/**
 * A reusable Card component that demonstrates React Component Composition.
 * By accepting `children` and `header` props, this component can wrap 
 * arbitrary content without knowing what that content is.
 */
const Card = ({ children, header, footer, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{header}</h3>
        </div>
      )}
      
      <div className="px-6 py-4">
        {/* Component Composition happens here! The Card renders whatever is passed as children. */}
        {children}
      </div>

      {footer && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
