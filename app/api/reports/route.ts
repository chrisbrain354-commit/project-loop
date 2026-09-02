import { withAuth } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  return withAuth(["ADMIN", "ANALYST", "VIEWER"], async ({ workspaceId }) => {
    return prisma.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function POST(req: Request) {
  return withAuth(["ADMIN", "ANALYST"], async ({ workspaceId, userId }) => {
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);

    const feedback = await prisma.feedback.findMany({
      where: {
        workspaceId,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      include: { themes: { include: { theme: true } } },
    });

    const total = feedback.length;
    const sentimentCounts = { POS: 0, NEU: 0, NEG: 0, unclassified: 0 };
    feedback.forEach((f) => {
      if (f.sentiment) sentimentCounts[f.sentiment]++;
      else sentimentCounts.unclassified++;
    });

    const themeCounts: Record<string, number> = {};
    feedback.forEach((f) => {
      f.themes.forEach((ft) => {
        themeCounts[ft.theme.name] = (themeCounts[ft.theme.name] || 0) + 1;
      });
    });
    const topThemes = Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const sampleQuotes = feedback
      .filter((f) => f.sentiment === "NEG" || f.sentiment === "POS")
      .slice(0, 6)
      .map((f) => `"${f.content}" (${f.sentiment}, ${f.channel})`);

    const stats = {
      total,
      sentimentCounts,
      topThemes,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    };

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    const prompt = `Write a Voice-of-Customer summary for a product leadership team based on this real data. Be concise and specific — reference the actual numbers given. Do not invent any statistics beyond what's provided.

Period: ${periodStart.toDateString()} to ${periodEnd.toDateString()}
Total feedback items: ${total}
Sentiment: ${sentimentCounts.POS} positive, ${sentimentCounts.NEU} neutral, ${sentimentCounts.NEG} negative, ${sentimentCounts.unclassified} unclassified
Top themes: ${topThemes.map(([name, count]) => `${name} (${count})`).join(", ")}
Sample quotes:
${sampleQuotes.join("\n")}

Write 3 short sections: "Summary", "What's working", "What needs attention" — each 2-3 sentences, plain language, no headers formatting beyond the section names.`;

    const result = await model.generateContent(prompt);
    const narrative = result.response.text();

    const report = await prisma.report.create({
      data: {
        title: `Voice of Customer — ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}`,
        periodStart,
        periodEnd,
        contentJson: { stats, narrative, sampleQuotes },
        workspaceId,
        generatedBy: userId,
      },
    });

    return report;
  });
}