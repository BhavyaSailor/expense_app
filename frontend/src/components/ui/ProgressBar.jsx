function ProgressBar({ value = 0, tone = 'ok', label }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="progress" role="progressbar" aria-valuenow={Math.round(width)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span className={tone} style={{ width: `${width}%` }} />
    </div>
  );
}

export default ProgressBar;
