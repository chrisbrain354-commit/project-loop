"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface RowError {
  row: number;
  reason: string;
}

interface UploadResult {
  imported: number;
  failed: number;
  errors: RowError[];
}

export default function BulkUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setResult(null);
    setError(null);

    if (!file) {
      setFileName(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a .csv file");
      setFileName(null);
      return;
    }

    setFileName(file.name);
  }

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const csvText = await file.text();

      const res = await fetch("/api/feedback/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      setResult(data);
      router.refresh();
    } catch {
      setError("Unable to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleReset() {
    setFileName(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-7">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-900">Bulk import feedback</h2>
        <p className="mt-1 text-xs text-slate-500">
          Upload a CSV with columns: content, channel, customer_label, created_at
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
        >
          Choose file
        </label>
        <span className="text-sm text-slate-500">
          {fileName ?? "No file selected"}
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      {fileName && !result && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Importing..." : "Import feedback"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={uploading}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300"
          >
            Cancel
          </button>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <div className="flex gap-3">
            <div className="rounded-xl bg-indigo-50 px-3 py-2">
              <p className="text-[11px] font-semibold text-indigo-700">
                {result.imported} imported
              </p>
            </div>
            {result.failed > 0 && (
              <div className="rounded-xl bg-red-50 px-3 py-2">
                <p className="text-[11px] font-semibold text-red-700">
                  {result.failed} failed
                </p>
              </div>
            )}
          </div>

          {result.errors.length > 0 && (
            <div className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-slate-600">
                  Row {err.row}: {err.reason}
                </p>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Upload another file
          </button>
        </div>
      )}
    </div>
  );
}