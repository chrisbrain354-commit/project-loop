import { withAuth } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";
import Papa from "papaparse";
import { z } from "zod";

export const dynamic = "force-dynamic";

const VALID_CHANNELS = [
  "Support ticket",
  "App store review",
  "NPS survey",
  "Sales call note",
  "Community post",
];

const feedbackRowSchema = z.object({
  content: z.string().min(1, "Content is required"),
  channel: z.enum(VALID_CHANNELS as [string, ...string[]], {
    error: `Channel must be one of: ${VALID_CHANNELS.join(", ")}`,
  }),
  customer_label: z.string().optional(),
  created_at: z.string().optional(),
});

interface RowError {
  row: number;
  reason: string;
}

export async function POST(req: Request) {
  return withAuth(["ADMIN", "ANALYST"], async ({ workspaceId }) => {
    const body = await req.json();
    const csvText: string | undefined = body?.csv;

    if (!csvText || typeof csvText !== "string") {
      return { imported: 0, failed: 0, errors: [{ row: 0, reason: "No CSV content provided" }] };
    }

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    const rows = parsed.data as Record<string, string>[];
    const errors: RowError[] = [];
    const validRows: {
      content: string;
      channel: string;
      customerLabel?: string;
      createdAt?: Date;
      workspaceId: string;
    }[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 accounts for header row + 1-indexing
      const result = feedbackRowSchema.safeParse(row);

      if (!result.success) {
        errors.push({
          row: rowNumber,
          reason: result.error.issues.map((i) => i.message).join("; "),
        });
        return;
      }

      let createdAt: Date | undefined;
      if (result.data.created_at) {
        const parsedDate = new Date(result.data.created_at);
        if (isNaN(parsedDate.getTime())) {
          errors.push({ row: rowNumber, reason: "Invalid created_at date format" });
          return;
        }
        createdAt = parsedDate;
      }

      validRows.push({
        content: result.data.content,
        channel: result.data.channel,
        customerLabel: result.data.customer_label || undefined,
        createdAt,
        workspaceId,
      });
    });

    if (validRows.length > 0) {
      await prisma.feedback.createMany({ data: validRows });
    }

    return {
      imported: validRows.length,
      failed: errors.length,
      errors,
    };
  });
}