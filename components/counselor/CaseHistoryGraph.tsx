"use client";

import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Activity, Minus, Info } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { calculateTrajectory } from "@/lib/risk/formulas/trajectory";

interface GraphDataPoint {
  id: string;
  distress_score: number | null;
  distress_level: string | null;
  immediate_danger?: boolean | null;
  submitted_at: string;
  type: "check_in" | "interaction";
}

export function CaseHistoryGraph({ data }: { data: GraphDataPoint[] }) {
  const points = useMemo(() => {
    return [...data]
      .filter((d) => d.distress_score !== null)
      .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
  }, [data]);

  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6 flex flex-col items-center justify-center text-center min-h-[200px]">
        <Activity className="h-8 w-8 text-muted-foreground/50 mb-3" />
        <h3 className="text-sm font-semibold text-foreground">No History Available</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Distress trajectory will appear here once numerical assessments are saved from check-ins or counselor sessions.
        </p>
      </div>
    );
  }

  const range = 100; // 0 to 100
  const currentPoint = points[points.length - 1];
  
  // Entire history array in "newest first" format required by calculateTrajectory
  const allScoresReversed = [...points].reverse().map(p => p.distress_score as number);
  const globalTrajectory = calculateTrajectory(allScoresReversed);
  
  // Calculate SMA line points
  const smaPoints = points.map((p, i) => {
    // For each point, the history is the slice from start up to this point
    const historySlice = [...points].slice(0, i + 1).reverse().map(x => x.distress_score as number);
    const traj = calculateTrajectory(historySlice);
    return traj.sma;
  });

  const getLevelColor = (score: number) => {
    if (score >= 75) return "text-red-600 fill-red-500 stroke-red-500";
    if (score >= 50) return "text-orange-500 fill-orange-500 stroke-orange-500";
    if (score >= 25) return "text-amber-500 fill-amber-500 stroke-amber-500";
    return "text-emerald-500 fill-emerald-500 stroke-emerald-500";
  };

  const getLevelBadgeClass = (score: number) => {
    if (score >= 75) return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-900";
    if (score >= 50) return "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-900";
    if (score >= 25) return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900";
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
  };
  
  const getLevelLabel = (score: number) => {
    if (score >= 75) return "CRITICAL";
    if (score >= 50) return "ELEVATED";
    if (score >= 25) return "CONCERN";
    return "STABLE";
  };

  const currentScore = currentPoint.distress_score as number;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Longitudinal Distress Trajectory
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Historical support-prioritisation scores across all sessions and check-ins.
          </p>
        </div>

        <div className="flex gap-6 rounded-lg bg-secondary/30 border border-border px-4 py-3 shrink-0">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Current Score</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${getLevelColor(currentScore).split(' ')[0]}`}>
                {currentScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getLevelBadgeClass(currentScore)}`}>
              {getLevelLabel(currentScore)}
            </span>
          </div>
          
          <div className="w-px bg-border my-1" />
          
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Shift</span>
            <div className="flex items-center gap-2 font-medium">
              {globalTrajectory.delta > 0 ? (
                <span className="flex items-center text-lg text-red-600 gap-0.5 font-bold">
                  <TrendingUp className="h-4 w-4" /> +{globalTrajectory.delta}
                </span>
              ) : globalTrajectory.delta < 0 ? (
                <span className="flex items-center text-lg text-emerald-600 gap-0.5 font-bold">
                  <TrendingDown className="h-4 w-4" /> {globalTrajectory.delta}
                </span>
              ) : (
                <span className="flex items-center text-lg text-slate-500 gap-0.5 font-bold">
                  <Minus className="h-4 w-4" /> 0
                </span>
              )}
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
              globalTrajectory.direction === 'WORSENING' || globalTrajectory.direction === 'VOLATILE' 
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30'
              : globalTrajectory.direction === 'IMPROVING'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30'
              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800'
            }`}>
              {globalTrajectory.direction.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-56 w-full border-b border-l border-border/80 pl-2">
        {/* Y-axis labels */}
        <div className="absolute -left-7 top-0 text-[10px] font-medium text-muted-foreground">100</div>
        <div className="absolute -left-7 top-1/4 text-[10px] font-medium text-muted-foreground">75</div>
        <div className="absolute -left-7 top-2/4 text-[10px] font-medium text-muted-foreground">50</div>
        <div className="absolute -left-7 top-3/4 text-[10px] font-medium text-muted-foreground">25</div>
        <div className="absolute -left-6 bottom-0 text-[10px] font-medium text-muted-foreground">0</div>

        <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
          {/* Background Severity Bands */}
          <rect x="0" y="0" width="100%" height="25%" className="fill-red-500/5 dark:fill-red-500/10" />
          <rect x="0" y="25%" width="100%" height="25%" className="fill-orange-500/5 dark:fill-orange-500/10" />
          <rect x="0" y="50%" width="100%" height="25%" className="fill-amber-500/5 dark:fill-amber-500/10" />
          <rect x="0" y="75%" width="100%" height="25%" className="fill-emerald-500/5 dark:fill-emerald-500/10" />

          {/* Reference Lines */}
          <line x1="0" y1="25%" x2="100%" y2="25%" className="stroke-border stroke-[1] stroke-dasharray-4" strokeDasharray="4 4" />
          <line x1="0" y1="50%" x2="100%" y2="50%" className="stroke-border stroke-[1] stroke-dasharray-4" strokeDasharray="4 4" />
          <line x1="0" y1="75%" x2="100%" y2="75%" className="stroke-border stroke-[1] stroke-dasharray-4" strokeDasharray="4 4" />

          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* SMA Secondary Trend Line */}
          {points.length > 1 && (
            <polyline
              points={smaPoints
                .map((sma, i) => {
                  const x = (i / (points.length - 1)) * 100;
                  const y = 100 - (sma / range) * 100;
                  return `${x}%,${y}%`;
                })
                .join(" ")}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 6"
              className="opacity-50"
            />
          )}

          {/* Main Score Line */}
          <polyline
            points={points
              .map((p, i) => {
                const x = points.length === 1 ? 50 : (i / (points.length - 1)) * 100;
                const y = 100 - ((p.distress_score as number) / range) * 100;
                return `${x}%,${y}%`;
              })
              .join(" ")}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />

          {points.map((p, i) => {
            const x = points.length === 1 ? 50 : (i / (points.length - 1)) * 100;
            const y = 100 - ((p.distress_score as number) / range) * 100;
            return (
              <circle
                key={`circle-${p.id}`}
                cx={`${x}%`}
                cy={`${y}%`}
                r={hoveredPointId === p.id ? "6" : "4"}
                className={`${getLevelColor(p.distress_score as number)} stroke-[3px] stroke-background transition-all duration-200`}
              />
            );
          })}
        </svg>

        {/* Interactive Tooltip Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {points.map((p, i) => {
            const x = points.length === 1 ? 50 : (i / (points.length - 1)) * 100;
            const y = 100 - ((p.distress_score as number) / range) * 100;
            const isHovered = hoveredPointId === p.id;
            
            return (
              <div 
                key={`overlay-${p.id}`}
                className="absolute w-8 h-8 -ml-4 -mt-4 cursor-pointer pointer-events-auto"
                style={{ left: `${x}%`, top: `${y}%` }}
                onMouseEnter={() => setHoveredPointId(p.id)}
                onMouseLeave={() => setHoveredPointId(null)}
              >
                {isHovered && (
                  <div className="absolute z-20 bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg text-xs pointer-events-none p-3 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{formatDate(p.submitted_at).split(" ")[0]}</span>
                        <span className={`px-1.5 py-0.5 rounded-[4px] border ${getLevelBadgeClass(p.distress_score as number)} text-[9px] uppercase tracking-wider font-bold`}>
                          {getLevelLabel(p.distress_score as number)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center bg-muted/50 rounded px-2 py-1">
                         <span className="text-muted-foreground font-medium">Score</span>
                         <span className={`font-bold ${getLevelColor(p.distress_score as number).split(' ')[0]}`}>{p.distress_score}/100</span>
                      </div>
                      
                      <div className="grid grid-cols-[1fr_2fr] gap-x-2 gap-y-1 mt-1">
                        <span className="text-muted-foreground">Source:</span>
                        <span className="text-right text-foreground font-medium truncate">{p.type === 'interaction' ? 'Counselor Session' : 'Victim Check-in'}</span>
                        
                        <span className="text-muted-foreground">Trend SMA:</span>
                        <span className="text-right text-foreground font-medium truncate">{smaPoints[i]}</span>
                      </div>

                      {p.immediate_danger && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 bg-red-100 dark:bg-red-950 px-2 py-1 rounded font-medium border border-red-200 dark:border-red-900">
                          <Info className="h-3 w-3 shrink-0" /> Immediate Danger
                        </div>
                      )}
                    </div>
                    {/* Arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-popover border-b border-r border-border rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* X-axis labels floating below */}
        <div className="absolute -bottom-7 left-0 right-0 h-6">
          {points.map((p, i) => {
            // Decimate labels if too many points mapping
            if (points.length > 10 && i % Math.ceil(points.length / 6) !== 0 && i !== points.length - 1 && i !== 0) {
              return null;
            }
            const x = points.length === 1 ? 50 : (i / (points.length - 1)) * 100;
            return (
              <div 
                key={`label-${p.id}`} 
                className="absolute whitespace-nowrap text-[10px] text-muted-foreground font-medium transform -translate-x-1/2 bg-card px-1"
                style={{ left: `${x}%`, top: '8px' }}
              >
                {formatDate(p.submitted_at).split(" ")[0]}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
         <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded-sm"></div> Critical</span>
         <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-500/20 border border-orange-500/50 rounded-sm"></div> Elevated</span>
         <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500/20 border border-amber-500/50 rounded-sm"></div> Concern</span>
         <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/50 rounded-sm"></div> Stable</span>
         <span className="flex items-center gap-1.5 ml-4"><div className="w-4 h-[2px] bg-slate-400 border border-slate-400 border-dashed"></div> Trend (SMA)</span>
      </div>
    </div>
  );
}
