"use client";

import { useState } from "react";
import { DISTRESS_SIGNAL_DISCLAIMER } from "@/lib/constants";
import { Activity, ShieldAlert } from "lucide-react";

interface DailySignal {
  day: string;
  avgScore: number;
  activeCases: number;
}

interface CaseloadTrendChartProps {
  dailySignals: DailySignal[];
}

export function CaseloadTrendChart({ dailySignals }: CaseloadTrendChartProps) {
  const [hoveredDay, setHoveredDay] = useState<DailySignal | null>(null);

  const width = 500;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 25, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const barWidth = Math.min(36, (chartWidth / dailySignals.length) * 0.6);

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    return padding.top + chartHeight - (clamped / 100) * chartHeight;
  };

  const getX = (index: number) => {
    return (
      padding.left +
      (index / dailySignals.length) * chartWidth +
      (chartWidth / dailySignals.length) / 2
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
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

      <div className="rounded border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900 leading-snug">
        <div className="flex items-start gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-700 mt-0.5" />
          <span>{DISTRESS_SIGNAL_DISCLAIMER}</span>
        </div>
      </div>

      <div className="relative pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible select-none">
          {/* Horizontal Grid lines */}
          {[25, 50, 75, 100].map((val) => (
            <g key={val}>
              <line
                x1={padding.left}
                y1={getY(val)}
                x2={width - padding.right}
                y2={getY(val)}
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeDasharray="2 2"
              />
              <text
                x={padding.left - 5}
                y={getY(val) + 3}
                textAnchor="end"
                fontSize={9}
                className="fill-muted-foreground font-mono"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Bars */}
          {dailySignals.map((d, idx) => {
            const x = getX(idx) - barWidth / 2;
            const y = getY(d.avgScore);
            const barHeight = padding.top + chartHeight - y;

            const isHovered = hoveredDay?.day === d.day;
            const fillColor =
              d.avgScore >= 75
                ? "rgb(239 68 68 / 0.85)"
                : d.avgScore >= 50
                ? "rgb(249 115 22 / 0.85)"
                : d.avgScore >= 25
                ? "rgb(234 179 8 / 0.85)"
                : "rgb(99 102 241 / 0.85)";

            return (
              <g
                key={d.day}
                className="cursor-pointer transition-opacity hover:opacity-90"
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(4, barHeight)}
                  rx={3}
                  fill={fillColor}
                  opacity={isHovered ? 1 : 0.75}
                />
                <text
                  x={getX(idx)}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-muted-foreground font-medium"
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredDay && (
          <div className="rounded-md border border-border bg-popover px-3 py-1.5 text-xs shadow-md text-popover-foreground w-fit mx-auto mt-1 flex items-center gap-3">
            <span>
              <strong>{hoveredDay.day}</strong>
            </span>
            <span>Avg Support Score: <strong>{hoveredDay.avgScore}/100</strong></span>
            <span className="text-muted-foreground">({hoveredDay.activeCases} cases monitored)</span>
          </div>
        )}
      </div>
    </div>
  );
}
