"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { cn } from "cn";

export type LiveWaveformProps = HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  processing?: boolean;
  barWidth?: number;
  barHeight?: number;
  barGap?: number;
  barRadius?: number;
  barColor?: string;
  height?: string | number;
  updateRate?: number;
};

export function LiveWaveform({
  active = false,
  processing = false,
  barWidth = 3,
  barHeight = 4,
  barGap = 2,
  barRadius = 2,
  barColor = "currentColor",
  height = 32,
  updateRate = 80,
  className,
  ...props
}: LiveWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animationFrame = 0;
    let lastUpdate = 0;
    let phase = 0;

    const draw = (time: number) => {
      const rect = container.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(1, rect.width);
      const canvasHeight = Math.max(1, rect.height);

      if (
        canvas.width !== width * ratio ||
        canvas.height !== canvasHeight * ratio
      ) {
        canvas.width = width * ratio;
        canvas.height = canvasHeight * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${canvasHeight}px`;
      }

      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, canvasHeight);

      if (time - lastUpdate >= updateRate) {
        lastUpdate = time;
        phase += 0.12;
      }

      const step = barWidth + barGap;
      const count = Math.ceil(width / step);
      const center = canvasHeight / 2;
      context.fillStyle = barColor;

      for (let index = 0; index < count; index += 1) {
        const normalized = count > 1 ? index / (count - 1) : 0.5;
        const distance = Math.abs(normalized - 0.5) * 2;
        const envelope = 1 - distance * 0.55;
        const wave = Math.abs(Math.sin(phase + index * 0.42));
        const idleHeight = barHeight;
        const animatedHeight =
          processing || active
            ? idleHeight + wave * canvasHeight * 0.55 * envelope
            : idleHeight;
        const barY = center - animatedHeight / 2;
        const x = index * step;

        context.beginPath();
        context.roundRect(x, barY, barWidth, animatedHeight, barRadius);
        context.fill();
      }

      animationFrame = requestAnimationFrame(draw);
    };

    animationFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrame);
  }, [
    active,
    barColor,
    barGap,
    barHeight,
    barRadius,
    barWidth,
    processing,
    updateRate,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
      aria-label={
        active
          ? "Live audio waveform"
          : processing
            ? "Processing audio"
            : "Audio waveform idle"
      }
      role="img"
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-hidden="true"
      />
    </div>
  );
}
