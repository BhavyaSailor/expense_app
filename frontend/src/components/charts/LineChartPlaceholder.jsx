function LineChartPlaceholder({ title, subtitle, data = [] }) {
  const points = Array.isArray(data)
    ? data.map((item) => {
        const value = Number(item.value ?? item.total ?? item.totalSpent ?? item.amount ?? 0);
        const label = item.label ?? item.category ?? item.name ?? String(item._id ?? '');
        return { label, value };
      })
    : [];

  const maxValue = points.length > 0 ? Math.max(...points.map((point) => point.value), 1) : 1;
  const hasData = points.length > 0 && points.some((point) => point.value > 0);

  return (
    <div className="card chart-card">
      <div className="card-inner">
        <div className="card-header">
          <h2 className="section-title">{title}</h2>
          <p className="text-muted">{subtitle}</p>
        </div>
        {hasData ? (
          <div className="line-chart">
            <div className="line-chart-bars">
              {points.map((point) => {
                const height = Math.round((point.value / maxValue) * 100);
                return (
                  <div key={point.label} className="line-chart-bar" style={{ height: `${height}%` }}>
                    <span>{point.value.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <div className="line-chart-labels">
              {points.map((point) => (
                <span key={point.label} className="line-chart-label">
                  {point.label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="chart-placeholder">
            <div className="placeholder-grid">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="placeholder-bar" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LineChartPlaceholder;
