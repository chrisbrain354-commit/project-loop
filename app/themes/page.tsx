"use client";

import { useState, useEffect } from "react";

interface Theme {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  feedbackCount: number;
}

interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  status: string;
  createdAt: string;
}

interface Trend {
  themeId: string;
  name: string;
  color: string | null;
  thisWeek: number;
  lastWeek: number;
  percentChange: number | null;
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [themeFeedback, setThemeFeedback] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    fetch("/api/themes")
      .then((res) => res.json())
      .then((data) => {
        setThemes(data);
        setLoading(false);
      });

    fetch("/api/themes/trends")
      .then((res) => res.json())
      .then(setTrends);
  }, []);

  async function handleThemeClick(theme: Theme) {
    setSelectedTheme(theme);
    setLoadingFeedback(true);
    const res = await fetch(`/api/themes/${theme.id}`);
    const data = await res.json();
    setThemeFeedback(data.feedback);
    setLoadingFeedback(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">

        <div className="mb-7">
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Themes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Feedback grouped by topic, based on AI classification.
          </p>
        </div>

        {trends.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <h2 className="mb-3 text-sm font-bold text-slate-900">This week vs last week</h2>
            <div className="space-y-2">
              {trends
                .filter((t) => t.thisWeek > 0 || t.lastWeek > 0)
                .slice(0, 5)
                .map((t) => (
                  <div key={t.themeId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: t.color ?? "#6366f1" }}
                      />
                      <span className="text-slate-700">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {t.lastWeek} → {t.thisWeek}
                      </span>
                      {t.percentChange !== null && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            t.percentChange > 0
                              ? "bg-red-50 text-red-700"
                              : t.percentChange < 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {t.percentChange > 0 ? "+" : ""}
                          {t.percentChange}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading themes...</p>
        ) : (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeClick(theme)}
                className={`rounded-2xl border px-5 py-4 text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition hover:border-slate-300 ${
                  selectedTheme?.id === theme.id
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: theme.color ?? "#6366f1" }}
                    />
                    <span className="text-sm font-bold text-slate-900">{theme.name}</span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {theme.feedbackCount}
                  </span>
                </div>
                {theme.description && (
                  <p className="mt-1.5 text-xs text-slate-500">{theme.description}</p>
                )}
              </button>
            ))}
          </div>
        )}

        {selectedTheme && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <h2 className="mb-4 text-base font-bold text-slate-900">
              Feedback tagged "{selectedTheme.name}"
            </h2>

            {loadingFeedback ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : (
              <div className="space-y-3">
                {themeFeedback.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <p className="text-sm leading-6 text-slate-700">{item.content}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">
                        {item.channel}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                        {item.status.toLowerCase()}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}