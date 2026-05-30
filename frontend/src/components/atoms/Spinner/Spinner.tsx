import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', text }) => (
  <div className="spinner-wrap">
    <div className={`spinner-ring spinner-${size}`} />
    {text && <span>{text}</span>}
  </div>
);