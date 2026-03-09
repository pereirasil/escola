import React from 'react';

export function PageHeader({ title, description, children }) {
  return (
    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
      <div>
        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>{title}</h2>
        {description && <p className="page-description" style={{ margin: 0 }}>{description}</p>}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
