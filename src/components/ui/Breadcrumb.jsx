import React from 'react';
import { Link } from 'react-router-dom';

export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="breadcrumb-separator">/</span>}
            {isLast || !item.to ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <Link to={item.to}>{item.label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
