import { withAuth, ValidationError, NotFoundError } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateStatusSchema = z.object({
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(["ADMIN", "ANALYST"], async ({ workspaceId }) => {
    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Status must be NEW, REVIEWED, or ACTIONED");
    }

    const existing = await prisma.feedback.findFirst({
      where: { id: params.id, workspaceId },
    });

    if (!existing) {
      throw new NotFoundError("Feedback item not found in your workspace");
    }

    return prisma.feedback.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    });
  });
}