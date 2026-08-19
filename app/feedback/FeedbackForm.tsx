"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackForm() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("Support ticket");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          channel,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }

      setContent("");
      router.refresh();
    } catch {
      setError("Unable to add feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ================= CONTENT ================= */}
      <div>
        <label
          htmlFor="content"
          className="mb-1.5 block text-xs font-semibold text-slate-700"
        >
          Customer feedback
        </label>

        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          placeholder="What did the customer say?"
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>

      {/* ================= CHANNEL ================= */}
      <div>
        <label
          htmlFor="channel"
          className="mb-1.5 block text-xs font-semibold text-slate-700"
        >
          Feedback channel
        </label>

        <select
          id="channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        >
          <option value="Support ticket">
            Support ticket
          </option>

          <option value="App store review">
            App store review
          </option>

          <option value="NPS survey">
            NPS survey
          </option>

          <option value="Sales call note">
            Sales call note
          </option>

          <option value="Community post">
            Community post
          </option>
        </select>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      {/* ================= BUTTON ================= */}
      <button
        type="submit"
        disabled={submitting}
        className="group flex h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-[#111827] text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-indigo-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Adding feedback...
          </>
        ) : (
          <>
            Add feedback

            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </>
        )}
      </button>

    </form>
  );
}