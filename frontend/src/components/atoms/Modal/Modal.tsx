import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, title, children, size = 'md', showCloseButton = true,
}) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal-container modal-${size}`}>
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h3 className="modal-title">{title}</h3>}
            {showCloseButton && (
              <button className="modal-close" onClick={onClose}>✕</button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};