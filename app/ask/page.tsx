"use client";

import { useState } from "react";

interface Source {
  id: string;
  content: string;
  channel: string;
}

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setSources([]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setAnswer(data.answer);
      setSources(data.sources ?? []);
      setHistory((h) => [{ question, answer: data.answer }, ...h]);
      setQuestion("");
    } catch {
      setError("Unable to reach Ask LOOP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">

        <div className="mb-7">
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Ask LOOP</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ask questions about your customer feedback in plain English.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What are users saying about onboarding?"
              className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Thinking..." : "Ask"}
            </button>
          </form>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
            >
              {error}
            </div>
          )}

          {answer && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{answer}</p>

              {sources.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-slate-500">Based on:</p>
                  <div className="space-y-2">
                    {sources.map((s, i) => (
                      <div
                        key={s.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <p className="text-xs text-slate-600">
                          [{i + 1}] {s.content}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                          {s.channel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {history.length > 1 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500">Previous questions</p>
            {history.slice(1).map((h, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <p className="text-xs font-semibold text-slate-700">{h.question}</p>
                <p className="mt-1 text-xs text-slate-500">{h.answer}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}