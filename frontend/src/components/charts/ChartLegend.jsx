function ChartLegend({ items }) {
  return (
    <ul className="legend">
      {items.map((item) => (
        <li key={item.label}>
          <span className="swatch" style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export default ChartLegend;
