import { withAuth } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";

export const dynamic = "force-dynamic";

const FEEDBACK_CONTENT = [
  "Onboarding took forever — I couldn't figure out how to invite my team.",
  "The new dashboard is gorgeous and finally fast. Huge improvement.",
  "It does the job, but the mobile experience needs work.",
  "Love the new export feature, saved me an hour today.",
  "Billing page keeps timing out when I try to download an invoice.",
  "Setup wizard is confusing — took three tries to connect our data source.",
  "Support responded within minutes, really impressed with the turnaround.",
  "Would love a dark mode option, staring at white screens all day is rough.",
  "Search is basically unusable once you have more than a few hundred items.",
  "Really appreciate how clean the reporting view is now.",
  "Mobile app crashes every time I try to upload a photo.",
  "Two-factor login keeps failing on Android, had to disable it entirely.",
  "Load times have gotten noticeably worse over the past month.",
  "Still waiting on a reply to a ticket from over a week ago.",
  "The team loves the new commenting feature on reports.",
];

const CUSTOMER_LABELS = [
  "Acme Corp", "Nova Retail", "Bright Labs", "Fern & Co", "Redwood Systems",
  "Pixel Studio", "Northline Logistics", "Verve Health", "Anonymous",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: Request) {
  return withAuth(["ADMIN", "ANALYST"], async ({ workspaceId }) => {
    const body = await req.json().catch(() => ({}));
    const channel: string = body?.channel || "App store review";

    const count = 5 + Math.floor(Math.random() * 8); // 5-12 items

    const items = Array.from({ length: count }).map(() => ({
      content: randomFrom(FEEDBACK_CONTENT),
      channel,
      customerLabel: randomFrom(CUSTOMER_LABELS),
      workspaceId,
    }));

    await prisma.feedback.createMany({ data: items });

    return { imported: count, channel };
  });
}