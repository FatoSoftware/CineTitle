import React, { useState, useEffect } from 'react';

interface NumberSliderControlProps {
  id?: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  isPercent?: boolean; // If true, treats 0-1 as 0-100% in UI
  colorAccent?: 'amber' | 'emerald' | 'rose' | 'sky' | 'indigo' | 'slate';
  onChange: (val: number) => void;
  quickResetValue?: number;
}

export const NumberSliderControl: React.FC<NumberSliderControlProps> = ({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  isPercent = false,
  colorAccent = 'amber',
  onChange,
  quickResetValue,
}) => {
  // Display value calculation
  const displayVal = isPercent ? Math.round(value * 100) : value;
  const displayMin = isPercent ? Math.round(min * 100) : min;
  const displayMax = isPercent ? Math.round(max * 100) : max;
  const displayStep = isPercent && step < 1 ? step * 100 : step;

  const [textInput, setTextInput] = useState<string>(String(displayVal));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setTextInput(String(displayVal));
    }
  }, [displayVal, isFocused]);

  const handleTextCommit = () => {
    setIsFocused(false);
    let num = parseFloat(textInput);
    if (isNaN(num)) {
      setTextInput(String(displayVal));
      return;
    }
    // Clamp
    num = Math.max(displayMin, Math.min(displayMax, num));
    const finalVal = isPercent ? num / 100 : num;
    onChange(finalVal);
    setTextInput(String(num));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setTextInput(String(displayVal));
      setIsFocused(false);
      e.currentTarget.blur();
    }
  };

  const accentClasses = {
    amber: 'accent-amber-500 text-amber-400 focus-within:border-amber-500/80',
    emerald: 'accent-emerald-500 text-emerald-400 focus-within:border-emerald-500/80',
    rose: 'accent-rose-500 text-rose-400 focus-within:border-rose-500/80',
    sky: 'accent-sky-500 text-sky-400 focus-within:border-sky-500/80',
    indigo: 'accent-indigo-500 text-indigo-400 focus-within:border-indigo-500/80',
    slate: 'accent-slate-400 text-slate-300 focus-within:border-slate-500',
  }[colorAccent];

  return (
    <div className="space-y-1.5 select-none">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300 font-medium text-[11px] truncate">{label}</span>

        {/* Numeric Text Input Box with Unit */}
        <div
          className={`flex items-center bg-slate-950 border border-slate-700/80 rounded px-1.5 py-0.5 transition ${accentClasses}`}
        >
          <input
            id={id ? `input-${id}` : undefined}
            type="number"
            step={displayStep}
            min={displayMin}
            max={displayMax}
            value={textInput}
            onFocus={() => setIsFocused(true)}
            onBlur={handleTextCommit}
            onKeyDown={handleKeyDown}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-12 bg-transparent text-right text-xs font-mono font-bold text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-[10px] text-slate-400 font-mono ml-0.5 whitespace-nowrap">
            {isPercent ? '%' : unit}
          </span>
        </div>
      </div>

      {/* Range Slider */}
      <div className="flex items-center gap-2">
        <input
          id={id ? `slider-${id}` : undefined}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            if (!isNaN(parsed)) {
              onChange(parsed);
            }
          }}
          className={`w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer transition ${accentClasses}`}
        />
        {quickResetValue !== undefined && value !== quickResetValue && (
          <button
            type="button"
            onClick={() => onChange(quickResetValue)}
            title={`Restablecer a ${quickResetValue}`}
            className="text-[9px] text-slate-400 hover:text-amber-400 transition cursor-pointer shrink-0"
          >
            ↺
          </button>
        )}
      </div>
    </div>
  );
};
