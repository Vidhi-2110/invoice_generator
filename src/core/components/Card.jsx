const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
