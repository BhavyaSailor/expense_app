function PieChartPlaceholder({ title, subtitle, data = [] }) {
  const entries = Array.isArray(data)
    ? data.map((item) => {
        const value = Number(item.value ?? item.total ?? item.totalSpent ?? item.amount ?? 0);
        const label = item.label ?? item.category ?? item.name ?? String(item._id ?? '');
        return { label, value };
      })
    : [];

  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  const chartData = entries.map((entry, index) => ({
    ...entry,
    percent: total ? Math.round((entry.value / total) * 100) : 0,
    color: ['#10b981', '#3b82f6', '#f97316', '#ef4444', '#8b5cf6', '#14b8a6'][index % 6],
  }));

  const gradient = chartData
    .map((item, index) => {
      const start = chartData.slice(0, index).reduce((sum, chunk) => sum + chunk.percent, 0);
      const end = start + item.percent;
      return `${item.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="card chart-card">
      <div className="card-inner">
        <div className="card-header">
          <h2 className="section-title">{title}</h2>
          <p className="text-muted">{subtitle}</p>
        </div>
        {chartData.length > 0 && total > 0 ? (
          <div className="pie-chart">
            <div className="pie-ring" style={{ background: `conic-gradient(${gradient})` }} />
            <div className="pie-legend">
              {chartData.slice(0, 6).map((item) => (
                <div key={item.label} className="pie-legend-item">
                  <span className="pie-legend-marker" style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{item.percent}%</strong>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pie-placeholder">
            <div className="pie-ring" />
            <div className="pie-legend">
              <span>Housing</span>
              <span>Utilities</span>
              <span>Food</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PieChartPlaceholder;
