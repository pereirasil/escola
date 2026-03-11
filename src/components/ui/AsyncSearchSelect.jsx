import React, { useEffect, useRef, useState } from 'react';

export function AsyncSearchSelect({
  label,
  placeholder = 'Buscar...',
  selectedLabel,
  onSearch,
  onSelect,
  disabled = false,
  emptyMessage = 'Nenhum resultado encontrado.',
}) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open || disabled) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await onSearch(query);
        setOptions(result || []);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open, disabled, onSearch]);

  return (
    <div className="form-group async-search-select" ref={rootRef}>
      {label && <label>{label}</label>}
      <button
        type="button"
        className={`async-search-trigger${open ? ' open' : ''}`}
        onClick={() => !disabled && setOpen((current) => !current)}
        disabled={disabled}
      >
        <span>{selectedLabel || placeholder}</span>
        <span className="async-search-caret">▾</span>
      </button>

      {open && !disabled && (
        <div className="async-search-panel">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="async-search-input"
            autoFocus
          />
          <div className="async-search-results">
            {loading ? (
              <div className="async-search-state">Buscando...</div>
            ) : options.length === 0 ? (
              <div className="async-search-state">{emptyMessage}</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="async-search-option"
                  onClick={() => {
                    onSelect(option);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <strong>{option.label}</strong>
                  {option.description && <small>{option.description}</small>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
