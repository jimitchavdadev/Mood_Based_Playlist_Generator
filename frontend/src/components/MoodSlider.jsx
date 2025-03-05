import React from 'react';
import { cn } from '../lib/utils';

export function MoodSlider({ label, value, onChange, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between">
        <label className="text-sm font-medium text-purple-200 dark:text-purple-300">
          {label}
        </label>
        <span className="text-sm text-purple-200 dark:text-purple-300">
          {value}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-white/20 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}
