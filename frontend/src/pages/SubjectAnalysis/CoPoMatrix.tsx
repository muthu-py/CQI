

type CoPoMatrixProps = {
  mappings: Array<{
    co_id: string; // e.g. "CO1"
    po_weights: Record<string, number>; // e.g. { "PO1": 3, "PO2": 2 }
  }>;
};

const PO_KEYS = ["PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12"];

export function CoPoMatrix({ mappings }: CoPoMatrixProps) {
  const getBadgeStyle = (val: number | null | undefined) => {
    if (!val) return <span className="text-slate-300">-</span>;
    if (val === 3) return <div className="mx-auto w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-md font-bold text-xs">3</div>;
    if (val === 2) return <div className="mx-auto w-8 h-8 flex items-center justify-center bg-blue-300 text-on-secondary-container rounded-md font-bold text-xs">2</div>;
    return <div className="mx-auto w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-md font-bold text-xs">1</div>;
  };

  return (
    <div className="xl:col-span-2 bg-surface-container-lowest p-6 rounded-xl relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">grid_view</span>
          CO-PO Mapping Matrix
        </h3>
        <div className="flex gap-4 text-[10px] font-bold">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-100"></span> 1 - Slight</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-300"></span> 2 - Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> 3 - Substantial</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="py-3 px-2 text-[10px] uppercase text-on-surface-variant font-bold rounded-tl-lg">Outcome</th>
              {PO_KEYS.map((po, idx) => (
                 <th key={po} className={`py-3 px-2 text-[10px] uppercase text-on-surface-variant font-bold ${idx === PO_KEYS.length - 1 ? 'rounded-tr-lg' : ''}`}>
                   {po}
                 </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mappings.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-6 text-on-surface-variant italic">No CO-PO mapping data available.</td>
              </tr>
            ) : mappings.map((row, idx) => (
              <tr key={`${row.co_id}-${idx}`} className={idx % 2 === 1 ? 'bg-surface' : ''}>
                <td className="py-4 font-bold text-sm text-primary">{row.co_id}</td>
                {PO_KEYS.map((po) => (
                  <td key={po} className="py-4">{getBadgeStyle(row.po_weights[po])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
