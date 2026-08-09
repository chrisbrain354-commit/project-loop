import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { prisma } from "../lib/db";
import FeedbackForm from "./FeedbackForm";

export default async function FeedbackPage() {
  const session = await getServerSession(authOptions);
  const workspaceId = session?.user?.workspaceId as string;
  const role = session?.user?.role;

  const feedback = await prisma.feedback.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Feedback</h1>

      {role !== "VIEWER" && <FeedbackForm />}

      {role === "VIEWER" && (
        <p className="text-sm text-gray-500 mb-4">
          You have read-only access to feedback.
        </p>
      )}

      <div className="space-y-3">
        {feedback.length === 0 && (
          <p className="text-sm text-gray-500">No feedback yet — add one above.</p>
        )}

        {feedback.map((item) => (
          <div key={item.id} className="border rounded-md p-3">
            <p className="text-sm">{item.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {item.channel} · {item.status} ·{" "}
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}