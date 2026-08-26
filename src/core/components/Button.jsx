const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/15 focus:ring-indigo-500/20',
    secondary: 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm focus:ring-slate-500/20',
    outline: 'border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100/80 focus:ring-slate-500/20',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/15 focus:ring-red-500/20',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-500/20',
    violet: 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/15 focus:ring-violet-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="shrink-0" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      {children}
    </button>
  );
};

export default Button;
