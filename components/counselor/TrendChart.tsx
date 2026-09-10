"use client";

import { useState } from "react";
import { formatDateOnly } from "@/lib/utils";
import type { RiskScoreRow } from "@/types/database.types";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

interface TrendChartProps {
  scores: RiskScoreRow[]; // Expects chronological order (oldest to newest) or handles sorting
}

export function TrendChart({ scores }: TrendChartProps) {
  // Sort oldest to newest for chronological left-to-right plot
  const sortedScores = [...scores].sort(
    (a, b) => new Date(a.computed_at).getTime() - new Date(b.computed_at).getTime()
  );

  const [hoveredPoint, setHoveredPoint] = useState<{
    score: number;
    date: string;
    reason: string;
    x: number;
    y: number;
  } | null>(null);

  if (sortedScores.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-xs text-muted-foreground italic">
        No longitudinal signal points recorded yet. Submit check-ins to view the trend trajectory.
      </div>
    );
  }

  // Calculate trend direction
  let direction: "WORSENING" | "IMPROVING" | "STABLE" = "STABLE";
  if (sortedScores.length >= 2) {
    const diff =
      sortedScores[sortedScores.length - 1].score -
      sortedScores[sortedScores.length - 2].score;
    if (diff >= 10) direction = "WORSENING";
    else if (diff <= -10) direction = "IMPROVING";
  }

  // SVG Chart Dimensions
  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 25, bottom: 30, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // X coordinate calculation
  const getX = (index: number) => {
    if (sortedScores.length === 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (sortedScores.length - 1)) * chartWidth;
  };

  // Y coordinate calculation (0 is bottom, 100 is top)
  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    return padding.top + chartHeight - (clamped / 100) * chartHeight;
  };

  // Generate SVG path line
  const points = sortedScores.map((s, idx) => ({
    x: getX(idx),
    y: getY(s.score),
    score: s.score,
    date: formatDateOnly(s.computed_at),
    reason: s.signal_reason,
  }));

  const pathD =
    points.length === 1
      ? ""
      : points.reduce(
          (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
          ""
        );

  const areaD =
    points.length === 1
      ? ""
      : `${pathD} L ${points[points.length - 1].x} ${
          padding.top + chartHeight
        } L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Longitudinal Support Trajectory
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          {direction === "WORSENING" && (
            <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
              <TrendingUp className="h-3.5 w-3.5" /> Worsening
            </span>
          )}
          {direction === "IMPROVING" && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              <TrendingDown className="h-3.5 w-3.5" /> Improving
            </span>
          )}
          {direction === "STABLE" && (
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              <Minus className="h-3.5 w-3.5" /> Stable
            </span>
          )}
        </div>
      </div>

      <div className="relative rounded-lg border border-border bg-card p-3 shadow-sm">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible select-none"
        >
          {/* Threshold Background Bands */}
          {/* Critical: 76 - 100 */}
          <rect
            x={padding.left}
            y={getY(100)}
            width={chartWidth}
            height={getY(75) - getY(100)}
            fill="rgb(239 68 68 / 0.08)"
          />
          {/* Elevated: 51 - 75 */}
          <rect
            x={padding.left}
            y={getY(75)}
            width={chartWidth}
            height={getY(50) - getY(75)}
            fill="rgb(249 115 22 / 0.08)"
          />
          {/* Concern: 26 - 50 */}
          <rect
            x={padding.left}
            y={getY(50)}
            width={chartWidth}
            height={getY(25) - getY(50)}
            fill="rgb(234 179 8 / 0.08)"
          />
          {/* Stable: 0 - 25 */}
          <rect
            x={padding.left}
            y={getY(25)}
            width={chartWidth}
            height={getY(0) - getY(25)}
            fill="rgb(34 197 94 / 0.08)"
          />

          {/* Grid lines and Y axis labels */}
          {[0, 25, 50, 75, 100].map((val) => (
            <g key={val}>
              <line
                x1={padding.left}
                y1={getY(val)}
                x2={width - padding.right}
                y2={getY(val)}
                stroke="currentColor"
                strokeOpacity={0.12}
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 6}
                y={getY(val) + 3}
                textAnchor="end"
                fontSize={9}
                className="fill-muted-foreground font-mono"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Filled area */}
          {areaD && (
            <path
              d={areaD}
              fill="url(#trendGradient)"
              opacity={0.3}
            />
          )}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="var(--color-primary, #6366f1)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.date === p.date ? 6 : 4.5}
                className="fill-background stroke-primary stroke-[2.5] cursor-pointer transition-all hover:scale-125"
                onMouseEnter={() =>
                  setHoveredPoint({
                    score: p.score,
                    date: p.date,
                    reason: p.reason,
                    x: p.x,
                    y: p.y,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Date labels at bottom */}
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fontSize={9}
                className="fill-muted-foreground"
              >
                {p.date.split(" ")[0]}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-2.5 py-1.5 shadow-md text-[11px] text-popover-foreground whitespace-nowrap"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <div className="font-semibold flex items-center gap-1.5">
              <span>Score: {hoveredPoint.score}/100</span>
              <span className="text-muted-foreground font-normal">({hoveredPoint.date})</span>
            </div>
            <p className="text-[10px] text-muted-foreground max-w-[200px] truncate">
              {hoveredPoint.reason}
            </p>
          </div>
        )}
      </div>

      {/* Threshold Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> 0–25 Stable
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-yellow-500" /> 26–50 Concern
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-500" /> 51–75 Elevated
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" /> 76+ Critical
          </span>
        </div>
        <span>Hover nodes to view data</span>
      </div>
    </div>
  );
}
