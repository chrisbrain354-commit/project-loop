"use client";

import { useState, useEffect } from "react";

interface Report {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  contentJson: {
    stats: {
      total: number;
      sentimentCounts: { POS: number; NEU: number; NEG: number; unclassified: number };
      topThemes: [string, number][];
    };
    narrative: string;
  };
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadReports() {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
        if (data.length > 0) setSelected(data[0]);
      });
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate report");
        return;
      }
      loadReports();
    } catch {
      setError("Unable to generate report. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">

        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
              Voice of Customer
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              AI-generated summary of the last 30 days of feedback.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? "Generating..." : "Generate report"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
            <p className="text-sm font-semibold text-slate-700">No reports yet</p>
            <p className="mt-1 text-xs text-slate-500">Generate your first Voice of Customer report above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr]">
            <div className="space-y-2">
              {reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs transition ${
                    selected?.id === r.id
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {new Date(r.createdAt).toLocaleDateString()}
                </button>
              ))}
            </div>

            {selected && (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                <h2 className="mb-1 text-base font-bold text-slate-900">{selected.title}</h2>
                <p className="mb-4 text-xs text-slate-400">
                  {selected.contentJson.stats.total} feedback items analyzed
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    {selected.contentJson.stats.sentimentCounts.POS} positive
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {selected.contentJson.stats.sentimentCounts.NEU} neutral
                  </span>
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                    {selected.contentJson.stats.sentimentCounts.NEG} negative
                  </span>
                </div>

                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold text-slate-500">Top themes</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.contentJson.stats.topThemes.map(([name, count]) => (
                      <span
                        key={name}
                        className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700"
                      >
                        {name} ({count})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {selected.contentJson.narrative}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}