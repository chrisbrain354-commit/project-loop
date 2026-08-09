import { withAuth } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAuth(["ADMIN", "ANALYST", "VIEWER"], async ({ workspaceId }) => {
    return prisma.user.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  });
}