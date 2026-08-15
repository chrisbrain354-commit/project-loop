import { withAuth, ValidationError } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createFeedbackSchema = z.object({
  content: z.string().min(1, "Content is required"),
  channel: z.string().min(1, "Channel is required"),
  customerLabel: z.string().optional(),
});

// GET /api/feedback — list all feedback in the caller's workspace
// (basic list only for now — search/filter/pagination come in Week 2)
export async function GET(req: Request) {
  return withAuth(["ADMIN", "ANALYST", "VIEWER"], async ({ workspaceId }) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const search = searchParams.get("search")?.trim() || "";
    const pageSize = 20;

    const where = {
      workspaceId,
      ...(search && {
        content: {
          contains: search,
          mode: "insensitive" as const,
        },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.feedback.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
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