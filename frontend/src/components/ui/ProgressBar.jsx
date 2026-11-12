function ProgressBar({ value = 0, color = 'var(--primary)' }) {
  return (
    <div className="progress-bar">
      <span style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

export default ProgressBar;
