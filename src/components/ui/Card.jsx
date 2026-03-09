import React from 'react';

export function Card({ title, children, className = '', style = {} }) {
  return (
    <div className={`card ${className}`} style={style}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </div>
  );
}
