import { FiAlertCircle } from 'react-icons/fi';

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  prefix,
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
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm select-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${prefix ? 'pl-8 pr-4' : 'px-4'} py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <FiAlertCircle className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
