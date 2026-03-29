export default function DiscountCalculator({ licences }) {
  const hasDiscounts = licences.some((l) => l.fee.appliedDiscounts.length > 0);

  if (!hasDiscounts) return null;

  const totalSavings = licences.reduce((sum, l) => sum + l.fee.discountAmount, 0);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h4 className="font-semibold text-green-800 mb-2">Discounts Applied</h4>
      <div className="space-y-2 text-sm">
        {licences
          .filter((l) => l.fee.appliedDiscounts.length > 0)
          .map((licence, i) => (
            <div key={i}>
              <span className="font-medium text-green-700">{licence.type} Licence:</span>
              <ul className="ml-4">
                {licence.fee.appliedDiscounts.map((d, j) => (
                  <li key={j} className="text-green-600">
                    &#8226; £{d.amount} off — {d.reason}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        <div className="pt-2 border-t border-green-200 font-semibold text-green-800">
          Total Savings: £{totalSavings}
        </div>
      </div>
    </div>
  );
}
