import { withAuth } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAuth(["ADMIN", "ANALYST", "VIEWER"], async ({ workspaceId }) => {
    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { feedback: true },
        },
      },
      orderBy: {
        feedback: {
          _count: "desc",
        },
      },
    });

    return themes.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      color: t.color,
      feedbackCount: t._count.feedback,
    }));
  });
}