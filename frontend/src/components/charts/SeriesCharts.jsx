import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import ChartLegend from './ChartLegend';
import { useChartTheme } from '../../utils/chartTheme';
import { formatCompact } from '../../utils/api';

export function SavingsChart({ data, height = 280 }) {
  const c = useChartTheme();
  const tick = { fill: c.axis, fontSize: 12 };
  return (
    <div className="chart-box">
      <ChartLegend
        items={[
          { label: 'Saved each month', color: c.savings },
          { label: 'Running total', color: c.brand },
        ]}
      />
      <div role="img" aria-label="Chart of money saved each month and the running total">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} minTickGap={12} />
            <YAxis tickLine={false} axisLine={false} width={52} tick={tick} tickFormatter={formatCompact} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: c.cursor }} />
            <Bar dataKey="savings" name="Saved this month" fill={c.savings} radius={[4, 4, 0, 0]} maxBarSize={26} />
            <Line type="monotone" dataKey="total" name="Running total" stroke={c.brand} strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DailyChart({ data, height = 240 }) {
  const c = useChartTheme();
  const tick = { fill: c.axis, fontSize: 12 };
  return (
    <div role="img" aria-label="Area chart of money spent each day" className="chart-box">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 12, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} minTickGap={28} />
          <YAxis tickLine={false} axisLine={false} width={52} tick={tick} tickFormatter={formatCompact} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="value" name="Spent" stroke={c.expense} strokeWidth={2} fill={c.expense} fillOpacity={0.14} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
