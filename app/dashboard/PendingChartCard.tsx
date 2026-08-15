export default function PendingChartCard({
  title,
  subtitle,
  waitingFor,
}: {
  title: string;
  subtitle: string;
  waitingFor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="mb-3 text-xs text-slate-500">{subtitle}</p>
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200">
        <p className="max-w-[180px] text-center text-xs text-slate-400">{waitingFor}</p>
      </div>
    </div>
  );
}