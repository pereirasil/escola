import React, { useState } from 'react';

export function DataTable({ columns, data, emptyMessage = "Nenhum registro encontrado.", renderRow, pageSize = 10 }) {
  const [page, setPage] = useState(0);

  if (!data || data.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  const totalPages = Math.ceil(data.length / pageSize);
  const needsPagination = data.length > pageSize;
  const pageData = needsPagination ? data.slice(page * pageSize, (page + 1) * pageSize) : data;

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      </div>
      {needsPagination && (
        <div className="pagination">
          <button
            type="button"
            className="btn-secondary"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            Anterior
          </button>
          <span className="pagination-info">
            {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            className="btn-secondary"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Próximo
          </button>
        </div>
      )}
    </>
  );
}
