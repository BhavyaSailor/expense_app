function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      <div className="card-inner">
        {title || subtitle ? (
          <div className="card-header">
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="text-muted">{subtitle}</p>}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export default Card;
