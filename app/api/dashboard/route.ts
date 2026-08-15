import { withAuth } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withAuth(["ADMIN", "ANALYST", "VIEWER"], async ({ workspaceId }) => {
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel") || "";
    const dateFromParam = searchParams.get("dateFrom") || "";
    const dateToParam = searchParams.get("dateTo") || "";

    // Default window: last 45 days, unless the user picked a custom range
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 45);

    const dateFrom = dateFromParam ? new Date(dateFromParam) : defaultFrom;
    const dateTo = dateToParam ? new Date(dateToParam) : new Date();

    const where: any = {
      workspaceId,
      createdAt: { gte: dateFrom, lte: dateTo },
      ...(channel && { channel }),
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [total, newThisWeek, themeCount, itemsForVolume] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.count({
        where: { ...where, createdAt: { gte: sevenDaysAgo, lte: dateTo } },
      }),
      prisma.theme.count({ where: { workspaceId } }),
      prisma.feedback.findMany({
        where,
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const dayBuckets: Record<string, number> = {};
    itemsForVolume.forEach((f) => {
      const key = f.createdAt.toISOString().slice(0, 10);
      dayBuckets[key] = (dayBuckets[key] || 0) + 1;
    });

    const volumeData = Object.entries(dayBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      }));

    return {
      total,
      newThisWeek,
      themeCount,
      volumeData,
    };
  });
}