import { formatINR } from "@/lib/format";

export interface ReportChartDatum {
  label: string;
  value: number;
  color: string;
}

/** Simple dependency-free horizontal bar chart used by the reports. */
export function ReportChart({
  data,
  ariaLabel,
}: {
  data: ReportChartDatum[];
  ariaLabel: string;
  formatValue?: (value: number) => string;
}) {
  const format = formatValue ?? formatINR;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2.5" role="img" aria-label={ariaLabel}>
      {data.map((datum) => {
        const width = Math.max(Math.round((datum.value / max) * 100), datum.value > 0 ? 3 : 0);
        return (
          <div key={datum.label} className="flex items-center gap-2">
            <span className="w-[4.5rem] shrink-0 truncate text-xs text-muted-foreground">{datum.label}</span>
            <span className="h-5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full"
                style={{ width: `${width}%`, backgroundColor: datum.color }}
              />
            </span>
            <span className="w-20 shrink-0 text-right text-xs font-semibold text-foreground">
              {format(datum.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
