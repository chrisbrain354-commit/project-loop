"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SimulateChannelButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/feedback/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "App store review" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong");
        return;
      }

      setMessage(`Added ${data.imported} new items from ${data.channel}`);
      router.refresh();
    } catch {
      setMessage("Unable to simulate feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-7">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">Simulate incoming feedback</h2>
        <p className="mt-1 text-xs text-slate-500">
          Pull in a batch of feedback as if it arrived from an app store integration.
        </p>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Fetching..." : "Simulate App Store reviews"}
      </button>

      {message && (
        <p className="mt-3 text-xs font-medium text-indigo-700">{message}</p>
      )}
    </div>
  );
}