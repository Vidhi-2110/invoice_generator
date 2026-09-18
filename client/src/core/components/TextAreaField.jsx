import { FiAlertCircle } from 'react-icons/fi';

const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  rows = 3,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required && '*'}
        </label>
      )}
      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <FiAlertCircle className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
};

export default TextAreaField;
