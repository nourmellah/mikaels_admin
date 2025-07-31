import React from 'react';

interface SliderWithInputProps {
	label: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	onChange: (v: number) => void;
}

export function SliderWithInput({
	label,
	value,
	min,
	max,
	step = 1,
	onChange,
}: SliderWithInputProps) {
	return (
		<div className="flex items-center mb-4">
			<label className="w-20 mr-2 text-lg font-semibold text-gray-800 dark:text-white/90">
				{label}
			</label>

			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={e => onChange(Number(e.target.value))}
				className="flex-1 mr-2 h-2 rounded bg-gray-200 dark:bg-gray-700 accent-blue-500"
			/>

			<input
				type="number"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={e => {
					const v = Number(e.target.value);
					if (!Number.isNaN(v)) onChange(v);
				}}
				className="
          w-16
          text-right
          text-base
          text-gray-800 dark:text-white/90
          bg-transparent
          border border-gray-300 dark:border-gray-600
          rounded
          px-2 py-1
        "
			/>
		</div>
	);
}
