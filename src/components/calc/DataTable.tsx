/** Tabla de datos con texto real en el HTML (Google la lee). */
export function DataTable({ caption, head, rows, mono = true }: { caption: string; head: string[]; rows: (string | number)[][]; mono?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[28rem] border-collapse text-left text-[0.95rem]">
        <caption className="bg-surface px-5 py-4 text-left font-display text-lg font-bold">{caption}</caption>
        <thead>
          <tr className="border-y border-line bg-surface-2/60">
            {head.map((h) => (
              <th key={h} scope="col" className="px-5 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {r.map((c, j) => (
                <td key={j} className={`px-5 py-3 ${j > 0 && mono ? "font-mono tabular-nums" : ""}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
