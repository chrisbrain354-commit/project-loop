import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import FeedbackForm from "./FeedbackForm";
import BulkUploadForm from "./BulkUploadForm";
import SimulateChannelButton from "./SimulateChannelButton";
import FeedbackInbox from "./FeedbackInbox";

export default async function FeedbackPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const canEdit = role !== "VIEWER";

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

        {/* ================= FEEDBACK FORM + BULK UPLOAD + SIMULATE ================= */}
        {canEdit && (
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

            <div className="mb-6">
              <SimulateChannelButton />
            </div>
          </>
        )}

        {/* ================= VIEWER MESSAGE ================= */}
        {!canEdit && (
          <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            <p className="text-xs font-medium text-indigo-700">
              You have read-only access to feedback.
            </p>
          </div>
        )}

        {/* ================= FEEDBACK INBOX ================= */}
        <FeedbackInbox canEdit={canEdit} />

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