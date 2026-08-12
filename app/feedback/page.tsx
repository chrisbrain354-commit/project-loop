import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { prisma } from "../lib/db";
import FeedbackForm from "./FeedbackForm";
import BulkUploadForm from "./BulkUploadForm";

export default async function FeedbackPage() {
  const session = await getServerSession(authOptions);

  const workspaceId = session?.user?.workspaceId as string;
  const role = session?.user?.role;

  const feedback = await prisma.feedback.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">

        {/* ================= HEADER ================= */}
        <div className="mb-7 text-center">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />

            <span className="text-[11px] font-medium text-indigo-700">
              Customer feedback intelligence
            </span>
          </div>

          <h1 className="text-[30px] font-bold tracking-tight text-slate-900">
            Customer feedback
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Collect customer feedback from different channels and turn it
            into useful product insights.
          </p>

        </div>

        {/* ================= FEEDBACK FORM + BULK UPLOAD ================= */}
        {role !== "VIEWER" && (
          <>
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-7">

              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900">
                  Add customer feedback
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Capture what your customers are saying.
                </p>
              </div>

              <FeedbackForm />

            </div>

            <div className="mb-6">
              <BulkUploadForm />
            </div>
          </>
        )}

        {/* ================= VIEWER MESSAGE ================= */}
        {role === "VIEWER" && (
          <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            <p className="text-xs font-medium text-indigo-700">
              You have read-only access to feedback.
            </p>
          </div>
        )}

        {/* ================= FEEDBACK LIST ================= */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:px-7">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent feedback
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Customer feedback collected by your workspace.
              </p>
            </div>

            <div className="rounded-full bg-slate-100 px-2.5 py-1">
              <span className="text-[11px] font-semibold text-slate-600">
                {feedback.length}{" "}
                {feedback.length === 1 ? "item" : "items"}
              </span>
            </div>

          </div>

          {/* EMPTY STATE */}
          {feedback.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">

              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                💬
              </div>

              <p className="text-sm font-semibold text-slate-700">
                No feedback yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Add your first piece of customer feedback above.
              </p>

            </div>
          )}

          {/* FEEDBACK ITEMS */}
          <div className="space-y-3">

            {feedback.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
              >

                {/* CONTENT */}
                <p className="text-sm leading-6 text-slate-700">
                  {item.content}
                </p>

                {/* META */}
                <div className="mt-3 flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">
                    {item.channel.replaceAll("_", " ")}
                  </span>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600">
                    {item.status.toLowerCase()}
                  </span>

                  <span className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                </div>

              </div>
            ))}

          </div>

        </div>

        {/* ================= FOOTER ================= */}
        <p className="mt-5 text-center text-[10px] text-slate-400">
          Understand what your customers are saying.{" "}
          <span className="text-slate-500">
            Build what matters.
          </span>
        </p>

      </div>
    </main>
  );
}