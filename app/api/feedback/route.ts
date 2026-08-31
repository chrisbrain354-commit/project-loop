import { withAuth, ValidationError } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";
import { z } from "zod";
import { linkFeedbackToThemes } from "@/app/lib/themes";
import { classifyFeedback, embedText } from "@/app/lib/ai";

export const dynamic = "force-dynamic";

const createFeedbackSchema = z.object({
  content: z.string().min(1, "Content is required"),
  channel: z.string().min(1, "Channel is required"),
  customerLabel: z.string().optional(),
});

// GET /api/feedback — list feedback in the caller's workspace with
// pagination, search, and filters (channel, sentiment, status, date range)
export async function GET(req: Request) {
  return withAuth(["ADMIN", "ANALYST", "VIEWER"], async ({ workspaceId }) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const search = searchParams.get("search")?.trim() || "";
    const channel = searchParams.get("channel") || "";
    const sentiment = searchParams.get("sentiment") || "";
    const status = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const pageSize = 20;

    const where: any = {
      workspaceId,
      ...(search && {
        content: { contains: search, mode: "insensitive" as const },
      }),
      ...(channel && { channel }),
      ...(sentiment && { sentiment }),
      ...(status && { status }),
      ...((dateFrom || dateTo) && {
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
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

    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { name: true },
    });

    const classification = await classifyFeedback(
      parsed.data.content,
      existingThemes.map((t) => t.name)
    );

    const created = await prisma.feedback.create({
      data: {
        ...parsed.data,
        workspaceId,
        sentiment: classification?.sentiment ?? null,
        sentimentScore: classification?.sentimentScore ?? null,
      },
    });

try {
  const vector = await embedText(parsed.data.content);
  await prisma.embedding.create({
    data: { feedbackId: created.id, vector },
  });
} catch (err) {
  console.error("Embedding failed:", err);
}

    // Link to themes if classification succeeded and themes were identified
    if (classification?.themes?.length) {
      await linkFeedbackToThemes(created.id, classification.themes, workspaceId);
    }

    return created;
  });
}