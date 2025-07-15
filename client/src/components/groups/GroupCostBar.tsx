interface Props {
  paidAmount: number;
  expectedAmount: number;
  lossAmount: number;
  surplusAmount: number;
}

export default function GroupCostBar({ paidAmount, expectedAmount, lossAmount, surplusAmount }: Props) {
  // Sum the segments
  const totalBar = paidAmount + expectedAmount + (lossAmount || surplusAmount);
  const getPct = (value: number) =>
    totalBar > 0 ? `${(value / totalBar * 100).toFixed(2)}%` : '0%';

  return (
    <div className="w-full">
      <div className="flex h-16 w-full overflow-hidden rounded-lg">
        {/* Paid segment (blue) */}
        <div
          style={{ width: getPct(paidAmount) }}
          className="bg-blue-600 flex items-center justify-center text-white text-sm font-medium"
        >
          {paidAmount > 0 && paidAmount}
        </div>
        {/* Expected segment (yellow) */}
        <div
          style={{ width: getPct(expectedAmount) }}
          className="bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
        >
          {expectedAmount > 0 && expectedAmount}
        </div>
        {/* Loss (red) or surplus (green) */}
        <div
          style={{ width: getPct(lossAmount || surplusAmount) }}
          className={`flex items-center justify-center text-white text-sm font-medium ${
            surplusAmount > 0 ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {(lossAmount > 0 && lossAmount) || (surplusAmount > 0 && surplusAmount) || null}
        </div>
      </div>
    </div>
  );
}
