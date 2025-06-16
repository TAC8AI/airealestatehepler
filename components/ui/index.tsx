import React from 'react';

// Button component with minimalistic design
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: any;
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-secondary-200 hover:bg-secondary-300 text-secondary-800',
    outline: 'border border-secondary-300 hover:bg-secondary-50 text-secondary-700',
    ghost: 'hover:bg-secondary-100 text-secondary-700',
  };
  
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5 rounded',
    md: 'px-4 py-2 rounded-md',
    lg: 'text-lg px-6 py-3 rounded-md',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Card component with minimalistic design
export const Card = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div
      className={`bg-white rounded-md border border-secondary-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Input component with minimalistic design
export const Input = ({
  label,
  id,
  error,
  className = '',
  ...props
}: {
  label?: string;
  id: string;
  error?: string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Textarea component with minimalistic design
export const Textarea = ({
  label,
  id,
  error,
  className = '',
  ...props
}: {
  label?: string;
  id: string;
  error?: string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Select component with minimalistic design
export const Select = ({
  label,
  id,
  options,
  error,
  className = '',
  ...props
}: {
  label?: string;
  id: string;
  options: { value: string; label: string }[];
  error?: string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Badge component with minimalistic design
export const Badge = ({
  children,
  variant = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  [key: string]: any;
}) => {
  const variantClasses = {
    default: 'bg-secondary-100 text-secondary-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Alert component with minimalistic design
export const Alert = ({
  children,
  variant = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
  [key: string]: any;
}) => {
  const variantClasses = {
    default: 'bg-secondary-50 text-secondary-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    danger: 'bg-red-50 text-red-700',
  };
  
  return (
    <div
      className={`p-4 rounded-md ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Spinner component with minimalistic design
export const Spinner = ({
  size = 'md',
  className = '',
  ...props
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: any;
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };
  
  return (
    <div
      className={`inline-block border-primary-600 border-t-transparent rounded-full animate-spin ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
};

// Container component for consistent layout
export const Container = ({
  children,
  size = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  className?: string;
  [key: string]: any;
}) => {
  const sizeClasses = {
    sm: 'max-w-3xl',
    default: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };
  
  return (
    <div
      className={`mx-auto px-4 sm:px-6 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
