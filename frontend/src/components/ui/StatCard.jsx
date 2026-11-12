function StatCard({ title, value, change, icon, accent }) {
  return (
    <div className="card stat-card">
      <div className="card-inner">
        <div className="stat-card-top">
          <div>
            <p className="eyebrow">{title}</p>
            <h3>{value}</h3>
          </div>
          <div className={`icon-pill ${accent}`}>{icon}</div>
        </div>
        <p className="text-muted">{change}</p>
      </div>
    </div>
  );
}

export default StatCard;
