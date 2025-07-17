import React from 'react';

interface SegmentedBarProps {
  blue: number;
  yellow: number;
  red: number;
  green: number;
}

/**
 * A multi-segment bar where each segment is colored blue, yellow, red, or green.
 * Displays each segment’s value (rounded integer) and automatically computes widths.
 */
export default function SegmentedBar({ blue, yellow, red, green }: SegmentedBarProps) {
  // Total of all segments
  const total = blue + yellow + red + green;

  /**
   * Returns CSS width percentage for a segment value
   */
  const getWidth = (value: number) => {
    if (total <= 0) return '0%';
    const pct = (value / total) * 100;
    return `${pct.toFixed(2).replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1')}%`;
  };

  /**
   * Formats a segment value as an integer string
   */
  const formatValue = (value: number) => Math.round(value).toString();

  return (
    <div className="w-full">
      <div className="flex h-16 w-full overflow-hidden rounded-lg">
        {/* Blue segment */}
        <div
          style={{ width: getWidth(blue) }}
          className="bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
        >
          {blue > 0 && formatValue(blue)}
        </div>

        {/* Yellow segment */}
        <div
          style={{ width: getWidth(yellow) }}
          className="bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
        >
          {yellow > 0 && formatValue(yellow)}
        </div>

        {/* Red segment */}
        <div
          style={{ width: getWidth(red) }}
          className="bg-red-600 flex items-center justify-center text-white text-sm font-medium"
        >
          {red > 0 && formatValue(red)}
        </div>

        {/* Green segment */}
        <div
          style={{ width: getWidth(green) }}
          className="bg-green-600 flex items-center justify-center text-white text-sm font-medium"
        >
          {green > 0 && formatValue(green)}
        </div>
      </div>
    </div>
  );
}
