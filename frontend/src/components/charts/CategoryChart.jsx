import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { useChartTheme } from '../../utils/chartTheme';
import { formatRupee } from '../../utils/api';
import { formatPercent, titleCase } from '../../utils/finance';

function CategoryChart({ data }) {
  const c = useChartTheme();
  const rows = data.map((d, i) => ({
    ...d,
    name: d.name === 'other categories' ? 'Other categories' : titleCase(d.name),
    fill: d.name === 'other categories' ? c.categories[6] : c.categories[i % 6],
  }));
  const total = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="cat-chart">
      <div className="cat-donut" role="img" aria-label="Donut chart of spending by category">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="96%"
              paddingAngle={rows.length > 1 ? 2 : 0}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {rows.map((r) => (
                <Cell key={r.name} fill={r.fill} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <span className="muted small">Total spent</span>
          <strong>{formatRupee(total)}</strong>
        </div>
      </div>
      <ul className="cat-list">
        {rows.map((r) => (
          <li key={r.name}>
            <span className="swatch" style={{ background: r.fill }} />
            <span className="cat-name">{r.name}</span>
            <span className="cat-val">{formatRupee(r.value)}</span>
            <span className="cat-share muted">{formatPercent(r.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryChart;
