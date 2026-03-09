import React from 'react';

export function PageHeader({ title, description, children }) {
  return (
    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>{title}</h2>
        {description && <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)' }}>{description}</p>}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
