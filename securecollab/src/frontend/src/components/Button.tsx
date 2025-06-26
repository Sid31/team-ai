import { ReactNode } from "react";

export interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Reusable button component with built-in styling
 */
export function Button({
  onClick,
  disabled = false,
  className = "",
  children,
  size = 'medium',
}: ButtonProps) {
  // Size-specific classes
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-5 py-3 text-base',
    large: 'px-6 py-4 text-lg',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-inherit focus:outline-auto bg-gray mx-2 cursor-pointer rounded-lg border border-gray-500 ${sizeClasses[size]} font-medium text-white transition-colors duration-200 hover:border-blue-400 focus:outline-4 focus:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-50 ${className} `.trim()}
    >
      {children}
    </button>
  );
}
