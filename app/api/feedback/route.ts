import { withAuth, ValidationError } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";
import { z } from "zod";

const createFeedbackSchema = z.object({
  content: z.string().min(1, "Content is required"),
  channel: z.string().min(1, "Channel is required"),
  customerLabel: z.string().optional(),
});

// GET /api/feedback — list all feedback in the caller's workspace
// (basic list only for now — search/filter/pagination come in Week 2)
export async function GET() {
  return withAuth(["ADMIN", "ANALYST", "VIEWER"], async ({ workspaceId }) => {
    return prisma.feedback.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  });
}

// POST /api/feedback — create a single feedback item
export async function POST(req: Request) {
  return withAuth(["ADMIN", "ANALYST"], async ({ workspaceId }) => {
    const body = await req.json();
    const parsed = createFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message);
    }

    return prisma.feedback.create({
      data: {
        ...parsed.data,
        workspaceId,
        // sentiment, sentimentScore left null — AI classification comes in Week 3
        // status defaults to NEW automatically
      },
    });
  });
}