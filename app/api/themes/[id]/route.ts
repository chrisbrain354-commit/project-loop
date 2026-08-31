import { withAuth, NotFoundError } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(["ADMIN", "ANALYST", "VIEWER"], async ({ workspaceId }) => {
    const theme = await prisma.theme.findFirst({
      where: { id: params.id, workspaceId },
    });

    if (!theme) {
      throw new NotFoundError("Theme not found in your workspace");
    }

    const feedback = await prisma.feedback.findMany({
      where: {
        workspaceId,
        themes: { some: { themeId: params.id } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { theme, feedback };
  });
}