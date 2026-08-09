"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("support_ticket");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, channel }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    setContent("");
    router.refresh(); // re-fetches the server component below, showing the new item
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-md">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          className="w-full border rounded-md p-2 text-sm"
          placeholder="What did the customer say?"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Channel</label>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="w-full border rounded-md p-2 text-sm"
        >
          <option value="support_ticket">Support ticket</option>
          <option value="app_store_review">App store review</option>
          <option value="nps_survey">NPS survey</option>
          <option value="sales_call_note">Sales call note</option>
          <option value="community_post">Community post</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-black text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
      >
        {submitting ? "Adding..." : "Add feedback"}
      </button>
    </form>
  );
}