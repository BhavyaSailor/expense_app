import { formatRupee } from '../../utils/api';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const title = payload[0].payload?.full || label;
  return (
    <div className="tooltip">
      {title && <p className="tooltip-title">{title}</p>}
      {payload.map((item) => (
        <p key={item.dataKey || item.name} className="tooltip-row">
          <span className="swatch" style={{ background: item.color || item.payload?.fill }} />
          <span>{item.name}</span>
          <strong>{formatRupee(item.value)}</strong>
        </p>
      ))}
    </div>
  );
}

export default ChartTooltip;
