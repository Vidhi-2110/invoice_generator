import { useEffect, useId, useRef, useState } from 'react';
import { FiAlertCircle, FiCheck, FiChevronDown, FiSearch } from 'react-icons/fi';

/**
 * SearchableSelect — single-value dropdown with a search box.
 *
 * Props:
 *  label        – field label text
 *  options      – { value, label, description?, hint? }[]; search covers all of these
 *  value        – selected option value. A value missing from `options` is still shown as-is.
 *  onChange     – (value: string) => void; receives '' when the selection is cleared
 *  placeholder  – shown when nothing is selected
 *  emptyMessage – shown when there is nothing to list
 *  error        – validation error string
 *  required     – show asterisk
 */
const SearchableSelect = ({
  label,
  options = [],
  value = '',
  onChange,
  placeholder = 'Select…',
  emptyMessage = 'No options found',
  error,
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  const close = () => {
    setOpen(false);
    setSearch('');
  };

  const query = search.trim().toLowerCase();
  const filtered = options.filter((opt) =>
    [opt.value, opt.label, opt.description, opt.hint]
      .filter(Boolean)
      .some((text) => text.toLowerCase().includes(query))
  );
  const selected = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Keep the keyboard-highlighted option visible
  useEffect(() => {
    if (open) listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const select = (nextValue) => {
    onChange(nextValue);
    close();
    triggerRef.current?.focus();
  };

  const toggleOpen = () => {
    if (open) {
      close();
      return;
    }
    setActiveIndex(Math.max(options.findIndex((opt) => opt.value === value), 0));
    setOpen(true);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      // Enter must pick an option, not submit the surrounding form
      e.preventDefault();
      if (filtered[activeIndex]) select(filtered[activeIndex].value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
      triggerRef.current?.focus();
    }
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required && '*'}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          ref={triggerRef}
          onClick={toggleOpen}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border bg-white text-sm font-medium text-left transition-all focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : open
              ? 'border-indigo-500 ring-2 ring-indigo-500/10'
              : 'border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/10'
          }`}
        >
          <span className={`truncate ${value ? 'text-slate-800' : 'text-slate-400'}`}>
            {selected ? `${selected.label} — ${selected.description}` : value || placeholder}
          </span>
          <FiChevronDown
            size={16}
            className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
              <FiSearch size={13} className="text-slate-400 shrink-0" />
              <input
                autoFocus
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by code or description…"
                className="w-full text-xs font-semibold text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <ul id={listId} role="listbox" ref={listRef} className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-xs text-slate-400 text-center">{emptyMessage}</li>
              ) : (
                filtered.map((opt, index) => {
                  const isSelected = opt.value === value;
                  return (
                    <li
                      key={opt.value}
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => select(opt.value)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex items-start justify-between gap-2 px-4 py-2.5 cursor-pointer transition-colors ${
                        index === activeIndex ? 'bg-slate-50' : ''
                      }`}
                    >
                      <span className="min-w-0">
                        <span className={`block text-xs font-semibold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                          <span className="font-bold">{opt.label}</span>
                          {opt.description && ` — ${opt.description}`}
                        </span>
                        {opt.hint && <span className="block text-[11px] text-slate-400 mt-0.5">{opt.hint}</span>}
                      </span>
                      {isSelected && <FiCheck size={13} className="text-indigo-600 shrink-0 mt-0.5" />}
                    </li>
                  );
                })
              )}
            </ul>

            {value && (
              <div className="border-t border-slate-100 px-4 py-2">
                <button
                  type="button"
                  onClick={() => select('')}
                  className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <FiAlertCircle className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
};

export default SearchableSelect;
