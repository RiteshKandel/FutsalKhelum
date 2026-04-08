export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-8 py-3 rounded-[4px] font-display font-bold uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 disabled:opacity-50 text-xs';
  const variants = {
    primary: 'bg-primary text-background hover:brightness-110 shadow-[0_0_20px_rgba(204,255,0,0.3)]',
    secondary: 'border-2 border-secondary text-secondary hover:bg-secondary hover:text-black',
    ghost: 'text-gray-500 hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {label && <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{label}</label>}
      <input
        className="w-full bg-black border border-white/10 focus:border-primary outline-none px-4 py-3 text-white transition-all duration-300 font-sans text-sm focus:shadow-[0_0_15px_rgba(204,255,0,0.1)]"
        {...props}
      />
      {error && <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{error}</span>}
    </div>
  );
};

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`kinetic-glass p-8 ${className}`}>
      {children}
    </div>
  );
};
