"use client";

import { useState, useEffect, useCallback } from "react";
import VolumeChart from "./VolumeChart";
import PendingChartCard from "./PendingChartCard";
import DashboardFilters from "./DashboardFilters";

interface DashboardData {
  total: number;
  newThisWeek: number;
  themeCount: number;
  volumeData: { date: string; count: number }[];
}

export default function DashboardClient({ email }: { email: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [channel, setChannel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (channel) params.set("channel", channel);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    const res = await fetch(`/api/dashboard?${params.toString()}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [channel, dateFrom, dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function clearFilters() {
    setChannel("");
    setDateFrom("");
    setDateTo("");
  }

  const hasActiveFilters = Boolean(channel || dateFrom || dateTo);

  const stats = data
    ? [
        { label: "Total feedback", value: data.total.toLocaleString() },
        { label: "New this week", value: data.newThisWeek.toLocaleString() },
        { label: "% negative", value: "—" },
        { label: "Active themes", value: data.themeCount.toLocaleString() },
      ]
    : [];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">

        <div className="mb-7">
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Logged in as {email}</p>
        </div>

        <DashboardFilters
          channel={channel}
          setChannel={setChannel}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
            >
              <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-bold text-slate-900">Feedback volume</p>
          <p className="mb-2 text-xs text-slate-500">
            {dateFrom || dateTo ? "Selected date range" : "Last 45 days"}
            {channel && ` · ${channel}`}
          </p>
          {loading ? (
            <div className="flex h-[200px] items-center justify-center text-xs text-slate-400">
              Loading...
            </div>
          ) : (
            <VolumeChart data={data?.volumeData ?? []} />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PendingChartCard
            title="Sentiment breakdown"
            subtitle="Positive / neutral / negative"
            waitingFor="Awaiting AI classification — Week 3"
          />
          <PendingChartCard
            title="Top themes"
            subtitle="By feedback count"
            waitingFor="Awaiting theme clustering — Week 3"
          />
        </div>

      </div>
    </main>
  );
}