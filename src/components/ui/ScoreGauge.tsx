"use client";

import { cn } from "@/lib/utils";
import { scoreColor, scoreLabel } from "@/lib/mock-data";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function ScoreGauge({
  score,
  size = "md",
  showLabel = true,
}: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(5, score));
  const percentage = (clampedScore / 5) * 100;

  const sizeConfig = {
    sm: { radius: 28, strokeWidth: 4, textSize: "text-lg", containerSize: "w-16 h-16" },
    md: { radius: 42, strokeWidth: 6, textSize: "text-2xl", containerSize: "w-24 h-24" },
    lg: { radius: 56, strokeWidth: 8, textSize: "text-3xl", containerSize: "w-32 h-32" },
  };

  const { radius, strokeWidth, textSize, containerSize } = sizeConfig[size];
  const circumference = 2 * Math.PI * radius;
  const svgSize = (radius + strokeWidth) * 2;
  const center = svgSize / 2;
  const dashOffset = circumference - (percentage / 100) * circumference;

  const strokeColor =
    clampedScore >= 4
      ? "#16A34A"
      : clampedScore >= 3
      ? "#D97706"
      : clampedScore >= 2
      ? "#EA580C"
      : "#DC2626";

  return (
    <div className={cn("relative flex items-center justify-center", containerSize)}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="absolute inset-0 w-full h-full"
      >
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#F5F5F4"
          strokeWidth={strokeWidth}
        />
        {/* Score ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="score-ring transition-all duration-700"
        />
      </svg>

      <div className="flex flex-col items-center">
        <span className={cn("font-bold leading-none", textSize, scoreColor(clampedScore))}>
          {clampedScore.toFixed(1)}
        </span>
        {showLabel && (
          <span className="text-[9px] font-medium text-stone-400 mt-0.5 uppercase tracking-wide">
            {scoreLabel(clampedScore)}
          </span>
        )}
      </div>
    </div>
  );
}
