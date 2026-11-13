function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`.trim()}>
      {(title || action) && (
        <header className="panel-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p className="muted small">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export default Panel;
