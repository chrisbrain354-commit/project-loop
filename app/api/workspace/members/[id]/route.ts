import { withAuth, ValidationError, NotFoundError } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(["ADMIN"], async ({ workspaceId }) => {
    const body = await req.json();
    const parsed = updateRoleSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Invalid role value — must be ADMIN, ANALYST, or VIEWER");
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: params.id, workspaceId },
    });

    if (!targetUser) {
      throw new NotFoundError("User not found in your workspace");
    }

    return prisma.user.update({
      where: { id: params.id },
      data: { role: parsed.data.role },
      select: { id: true, name: true, email: true, role: true },
    });
  });
}