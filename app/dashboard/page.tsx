import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { prisma } from "../lib/db";
import VolumeChart from "./VolumeChart";
import PendingChartCard from "./PendingChartCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const workspaceId = session?.user?.workspaceId as string;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [total, newThisWeek, themeCount, recentFeedback] = await Promise.all([
    prisma.feedback.count({ where: { workspaceId } }),
    prisma.feedback.count({ where: { workspaceId, createdAt: { gte: sevenDaysAgo } } }),
    prisma.theme.count({ where: { workspaceId } }),
    prisma.feedback.findMany({
      where: { workspaceId },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Group feedback by day for the volume chart (last 45 days)
  const dayBuckets: Record<string, number> = {};
  const fortyFiveDaysAgo = new Date();
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

  recentFeedback
    .filter((f) => f.createdAt >= fortyFiveDaysAgo)
    .forEach((f) => {
      const key = f.createdAt.toISOString().slice(0, 10);
      dayBuckets[key] = (dayBuckets[key] || 0) + 1;
    });

  const volumeData = Object.entries(dayBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    }));

  const stats = [
    { label: "Total feedback", value: total.toLocaleString() },
    { label: "New this week", value: newThisWeek.toLocaleString() },
    { label: "% negative", value: "—" },
    { label: "Active themes", value: themeCount.toLocaleString() },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">

        <div className="mb-7">
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Logged in as {session?.user?.email}
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
            >
              <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* VOLUME CHART */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-bold text-slate-900">Feedback volume</p>
          <p className="mb-2 text-xs text-slate-500">Last 45 days</p>
          <VolumeChart data={volumeData} />
        </div>

        {/* SENTIMENT + THEMES */}
        <div className="grid gap-4 sm:grid-cols-2">
          <PendingChartCard
            title="Sentiment breakdown"
            subtitle="Positive / neutral / negative"
            waitingFor="Awaiting AI classification — Week 3"
          />
          <PendingChartCard
            title="Top themes"
            subtitle="By feedback count"
            waitingFor="Awaiting theme clustering — Week 3"
          />
        </div>

      </div>
    </main>
  );
}