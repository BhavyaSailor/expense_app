import Icon from './Icon';

function Button({ variant = 'secondary', size = '', loading = false, icon, className = '', children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`btn ${variant} ${size} ${className}`.trim()}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
    >
      {loading ? <span className="spinner" aria-hidden="true" /> : icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  );
}

export default Button;
