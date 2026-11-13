import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import ChartLegend from './ChartLegend';
import { useChartTheme } from '../../utils/chartTheme';
import { formatCompact } from '../../utils/api';

function TrendChart({ data, height = 280 }) {
  const c = useChartTheme();
  const tick = { fill: c.axis, fontSize: 12 };
  return (
    <div className="chart-box">
      <ChartLegend
        items={[
          { label: 'Income', color: c.income },
          { label: 'Expenses', color: c.expense },
        ]}
      />
      <div role="img" aria-label="Bar chart of income and expenses for each month">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 0 }} barGap={3} barCategoryGap="24%">
            <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} minTickGap={12} />
            <YAxis tickLine={false} axisLine={false} width={52} tick={tick} tickFormatter={formatCompact} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: c.cursor }} />
            <Bar dataKey="income" name="Income" fill={c.income} radius={[4, 4, 0, 0]} maxBarSize={26} />
            <Bar dataKey="expense" name="Expenses" fill={c.expense} radius={[4, 4, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TrendChart;
