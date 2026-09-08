import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiX, FiCheck, FiSearch } from 'react-icons/fi';

/**
 * MultiSelectDropdown
 *
 * Props:
 *  label             – field label text
 *  options           – string[] of available options
 *  selected          – string[] of currently selected values
 *  onChange          – (newSelected: string[]) => void
 *  placeholder       – placeholder shown when nothing is selected
 *  error             – validation error string
 *  required          – show asterisk
 *  containerClassName – extra wrapper class
 */
const MultiSelectDropdown = ({
  label,
  options = [],
  selected = [],
  onChange,
  placeholder = 'Select options…',
  error,
  required,
  containerClassName = '',
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (opt) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next);
  };

  const removeTag = (opt, e) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== opt));
  };

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Relative wrapper so dropdown panel anchors correctly */}
      <div className="relative">
        {/* Trigger button */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}
          className={`min-h-[42px] w-full flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl border cursor-pointer transition-all select-none bg-white
            ${open
              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : error
              ? 'border-red-400 ring-2 ring-red-400/20'
              : 'border-slate-200 hover:border-slate-300'
            }`}
        >
          {/* Selected tags */}
          {selected.length === 0 ? (
            <span className="text-xs text-slate-400 font-medium">{placeholder}</span>
          ) : (
            selected.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => removeTag(tag, e)}
                  className="text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  <FiX size={11} />
                </button>
              </span>
            ))
          )}

          {/* Chevron */}
          <span className="ml-auto pl-1 text-slate-400 shrink-0">
            <FiChevronDown
              size={16}
              className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </span>
        </div>

        {/* Dropdown Panel — anchored below the trigger */}
        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            {/* Search — only shown when there are more than 5 options */}
            {options.length > 5 && (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
                <FiSearch size={13} className="text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full text-xs font-semibold text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-400"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Options list */}
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-xs text-slate-400 text-center">No options found</li>
              ) : (
                filtered.map((opt) => {
                  const isSelected = selected.includes(opt);
                  return (
                    <li
                      key={opt}
                      onClick={(e) => { e.stopPropagation(); toggle(opt); }}
                      className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-xs font-semibold transition-colors
                        ${isSelected
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <span>{opt}</span>
                      {isSelected && (
                        <FiCheck size={13} className="text-indigo-600 shrink-0" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>

            {/* Footer: clear all */}
            {selected.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange([]); }}
                  className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-xs text-red-500 font-semibold mt-0.5">{error}</p>}
    </div>
  );
};

export default MultiSelectDropdown;
