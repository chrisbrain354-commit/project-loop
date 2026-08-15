"use client";

import { useState, useEffect, useCallback } from "react";

interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  sentiment: "POS" | "NEU" | "NEG" | null;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  createdAt: string;
}

interface InboxResponse {
  items: FeedbackItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const STATUS_OPTIONS: FeedbackItem["status"][] = ["NEW", "REVIEWED", "ACTIONED"];
const CHANNEL_OPTIONS = [
  "Support ticket",
  "App store review",
  "NPS survey",
  "Sales call note",
  "Community post",
];
const SENTIMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "POS", label: "Positive" },
  { value: "NEU", label: "Neutral" },
  { value: "NEG", label: "Negative" },
];

export default function FeedbackInbox({ canEdit }: { canEdit: boolean }) {
  const [data, setData] = useState<InboxResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [channel, setChannel] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, channel, sentiment, status, dateFrom, dateTo]);

  const loadPage = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (channel) params.set("channel", channel);
    if (sentiment) params.set("sentiment", sentiment);
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    const res = await fetch(`/api/feedback?${params.toString()}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page, debouncedSearch, channel, sentiment, status, dateFrom, dateTo]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  async function handleStatusChange(id: string, newStatus: FeedbackItem["status"]) {
    setUpdatingId(id);
    try {
      await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await loadPage();
    } finally {
      setUpdatingId(null);
    }
  }

  function clearFilters() {
    setChannel("");
    setSentiment("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  }

  const hasActiveFilters = channel || sentiment || status || dateFrom || dateTo || search;

  const selectClass =
    "h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-7">

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Recent feedback</h2>
          <p className="mt-1 text-xs text-slate-500">
            Customer feedback collected by your workspace.
          </p>
        </div>
        {data && (
          <div className="rounded-full bg-slate-100 px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-600">
              {data.total} {data.total === 1 ? "item" : "items"}
            </span>
          </div>
        )}
      </div>

      {/* SEARCH */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search feedback..."
        className="mb-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      />

      {/* FILTER BAR */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className={selectClass}
        >
          <option value="">All channels</option>
          {CHANNEL_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
          className={selectClass}
        >
          <option value="">All sentiment</option>
          {SENTIMENT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className={selectClass}
        />
        <span className="text-xs text-slate-400">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className={selectClass}
        />

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {!loading && data?.items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">No feedback found</p>
          <p className="mt-1 text-xs text-slate-500">
            {hasActiveFilters ? "Try adjusting your filters." : "Add your first piece of customer feedback above."}
          </p>
        </div>
      )}

      {/* ITEMS */}
      <div className="space-y-3">
        {data?.items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <p className="text-sm leading-6 text-slate-700">{item.content}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">
                {item.channel}
              </span>

              {item.sentiment && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                  {item.sentiment}
                </span>
              )}

              {canEdit ? (
                <select
                  value={item.status}
                  disabled={updatingId === item.id}
                  onChange={(e) =>
                    handleStatusChange(item.id, e.target.value as FeedbackItem["status"])
                  }
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600 outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.toLowerCase()}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600">
                  {item.status.toLowerCase()}
                </span>
              )}

              <span className="text-[10px] text-slate-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {data && data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages || loading}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}