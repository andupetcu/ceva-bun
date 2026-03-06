'use client';

import { useMemo } from 'react';

type Props = {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
};

export function BudgetSlider({ min, max, valueMin, valueMax, onMinChange, onMaxChange }: Props) {
  const minPercent = useMemo(() => ((valueMin - min) / (max - min)) * 100, [min, max, valueMin]);
  const maxPercent = useMemo(() => ((valueMax - min) / (max - min)) * 100, [min, max, valueMax]);

  return (
    <div className="space-y-3">
      <div className="relative h-3 rounded-full bg-slate-800/70">
        <div
          className="absolute h-3 rounded-full bg-emerald-400"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={(e) => onMinChange(Math.min(Number(e.target.value), valueMax - 100))}
          className="pointer-events-none absolute h-0 w-full appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={(e) => onMaxChange(Math.max(Number(e.target.value), valueMin + 100))}
          className="pointer-events-none absolute h-0 w-full appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400"
        />
      </div>
    </div>
  );
}
