/**  
 * One slice in a SegmentedBar  
 */
interface Segment {
  /** 
   * Numeric value for this slice; widths are computed proportionally 
   */
  value: number;
  /** 
   * Optional text label to show inside the slice 
   */
  label?: string;
  /** 
   * Any valid CSS color (hex, rgb, named, etc.) 
   */
  color: string;
  /** 
   * Text color to use inside this slice (default "#fff") 
   */
  textColor?: string;
}

export interface SegmentedBarProps {
  /** Array of slices to render; slices with value <= 0 are ignored */
  segments: Segment[];
  /** Show the `label` text inside each slice? */
  showLabels?: boolean;
  /** Show the numeric `value` inside each slice? */
  showValues?: boolean;
  /** Height of the bar (default "1.5rem") */
  height?: string;
}

export default function SegmentedBar({
  segments,
  showLabels = true,
  showValues = true,
  height = '1.5rem',
}: SegmentedBarProps) {
  const valid = segments.filter(s => s.value > 0);
  const total = valid.reduce((sum, s) => sum + s.value, 0);

  if (total === 0 || valid.length === 0) {
    return null;
  }

  return (
    <div
      className={`w-full bg-gray-200 overflow-hidden rounded-lg ${height}`}
    >
      <div className="flex h-full">
        {valid.map((s, idx) => {
          const pct = (s.value / total) * 100;
          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-center whitespace-nowrap"
              style={{
                backgroundColor: s.color,
                color: s.textColor ?? '#fff',
                width: `${pct}%`,
              }}
            >
              {showLabels && (
                <span className="text-xs">
                  {s.label}
                </span>
              )}
              {showValues && (
                <span className="text-sm font-medium">
                  {Math.round(s.value)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
