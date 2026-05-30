import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact' | 'elevated';
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children, title, icon, variant = 'default', onClick, className = '',
}) => (
  <div className={`card card-${variant} ${onClick ? 'card-clickable' : ''} ${className}`} onClick={onClick}>
    {(title || icon) && (
      <div className="card-title">
        {icon && <span>{icon}</span>}
        {title}
      </div>
    )}
    <div className="card-body">{children}</div>
  </div>
);