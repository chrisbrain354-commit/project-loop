"use client";

const CHANNEL_OPTIONS = [
  "Support ticket",
  "App store review",
  "NPS survey",
  "Sales call note",
  "Community post",
];

interface Props {
  channel: string;
  setChannel: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export default function DashboardFilters({
  channel, setChannel, dateFrom, setDateFrom, dateTo, setDateTo, onClear, hasActiveFilters,
}: Props) {
  const inputClass =
    "h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <select value={channel} onChange={(e) => setChannel(e.target.value)} className={inputClass}>
        <option value="">All channels</option>
        {CHANNEL_OPTIONS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClass} />
      <span className="text-xs text-slate-400">to</span>
      <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputClass} />

      {hasActiveFilters && (
        <button onClick={onClear} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
          Clear filters
        </button>
      )}
    </div>
  );
}