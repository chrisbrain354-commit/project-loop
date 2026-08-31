import { withAuth } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAuth(["ADMIN", "ANALYST", "VIEWER"], async ({ workspaceId }) => {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { id: true, name: true, color: true },
    });

    const trends = await Promise.all(
      themes.map(async (theme) => {
        const [thisWeek, lastWeek] = await Promise.all([
          prisma.feedbackTheme.count({
            where: {
              themeId: theme.id,
              feedback: { createdAt: { gte: oneWeekAgo, lte: now } },
            },
          }),
          prisma.feedbackTheme.count({
            where: {
              themeId: theme.id,
              feedback: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } },
            },
          }),
        ]);

        let percentChange: number | null = null;
        if (lastWeek > 0) {
          percentChange = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
        } else if (thisWeek > 0) {
          percentChange = 100;
        }

        return {
          themeId: theme.id,
          name: theme.name,
          color: theme.color,
          thisWeek,
          lastWeek,
          percentChange,
        };
      })
    );

    // Sort by biggest increase first, so spikes surface at the top
    trends.sort((a, b) => (b.percentChange ?? -999) - (a.percentChange ?? -999));

    return trends;
  });
}