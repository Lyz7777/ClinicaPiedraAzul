import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', onClick,
  disabled = false, loading = false, fullWidth = false,
  type = 'button', style, className = '',
}) => (
  <button
    type={type}
    className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className}`}
    onClick={onClick}
    disabled={disabled || loading}
    style={style}
  >
    {loading && <span className="btn-spinner" />}
    {children}
  </button>
);