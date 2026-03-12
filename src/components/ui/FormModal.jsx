import React from 'react';

const SIZE_CLASS = {
  default: '',
  wide: ' modal-content-wide',
  lg: ' modal-content-lg',
};

export function FormModal({ open, title, onClose, children, size = 'default' }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content${SIZE_CLASS[size] || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              lineHeight: 1,
              opacity: 0.7,
            }}
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
