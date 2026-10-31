import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ReportChartDatum {
  label: string;
  value: number;
  color: string;
}

/** Single simple bar chart used across reports. Renders only in the browser. */
export function ReportChart({
  data,
  ariaLabel,
  formatValue,
}: {
  data: ReportChartDatum[];
  ariaLabel: string;
  formatValue?: (value: number) => string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-44 rounded-xl bg-muted/50" aria-hidden="true" />;
  }

  return (
    <div className="h-44 w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={46}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
            }
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            formatter={(value: number | string) => (formatValue ? formatValue(Number(value)) : String(value))}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((datum) => (
              <Cell key={datum.label} fill={datum.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
