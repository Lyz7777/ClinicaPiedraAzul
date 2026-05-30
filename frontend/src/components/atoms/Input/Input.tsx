import React from 'react';

interface InputProps {
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  min?: string | number;
  max?: string | number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({
  label, value, onChange, placeholder, type = 'text',
  required = false, disabled = false, error, helperText,
  min, max, onKeyDown, icon, className = '', style,
}) => (
  <div className={`form-group ${error ? 'input-error' : ''} ${className}`} style={style}>
    {label && (
      <label className="input-label">
        {label}
        {required && <span className="input-required"> *</span>}
      </label>
    )}
    <div className="input-wrapper">
      {icon && <span className="input-icon-left">{icon}</span>}
      <input
        type={type}
        className="input-field"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        onKeyDown={onKeyDown}
      />
    </div>
    {error && <span className="input-error-message">{error}</span>}
    {helperText && !error && <span className="input-helper">{helperText}</span>}
  </div>
);