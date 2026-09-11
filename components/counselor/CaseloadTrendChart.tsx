"use client";

import { DISTRESS_SIGNAL_DISCLAIMER } from "@/lib/constants";
import { Activity, ShieldAlert } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts";
import type { BarShapeProps } from "recharts/types/cartesian/Bar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DailySignal {
  day: string;
  avgScore: number;
  activeCases: number;
}

interface CaseloadTrendChartProps {
  dailySignals: DailySignal[];
}

export function CaseloadTrendChart({ dailySignals }: CaseloadTrendChartProps) {
  const chartData = dailySignals.map((signal) => ({
    ...signal,
    fill:
      signal.avgScore >= 75
        ? "#991b1b"
        : signal.avgScore >= 50
          ? "#dc2626"
          : signal.avgScore >= 25
            ? "#d97706"
            : "#15803d",
  }));

  const chartConfig = {
    avgScore: {
      label: "Support Signal",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex aspect-[3/2] w-full max-w-none flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            Caseload Support Signal Trend
          </h3>
        </div>
        <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground font-medium">
          Last 7 Days
        </span>
      </div>

      <div className="rounded border border-teal-200 bg-secondary p-2.5 text-[11px] text-secondary-foreground leading-snug">
        <div className="flex items-start gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-secondary-foreground mt-0.5" />
          <span>{DISTRESS_SIGNAL_DISCLAIMER}</span>
        </div>
      </div>

      <div className="relative pt-2">
        <ChartContainer
          config={chartConfig}
          className="h-full min-h-40 w-full aspect-auto"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              domain={[0, 100]}
              ticks={[25, 50, 75, 100]}
              tickLine={false}
              axisLine={false}
              width={30}
              tick={{ fontSize: 9 }}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 10 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="avgScore"
              radius={4}
              maxBarSize={36}
              shape={({ index, ...props }: BarShapeProps) => (
                <Rectangle
                  {...props}
                  fill={props.payload?.fill}
                  fillOpacity={index === chartData.length - 1 ? 1 : 0.78}
                />
              )}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
