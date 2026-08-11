import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CHANNELS = [
  "Support ticket",
  "App store review",
  "NPS survey",
  "Sales call note",
  "Community post",
];

const CUSTOMER_LABELS = [
  "Acme Corp", "Nova Retail", "Bright Labs", "Fern & Co", "Redwood Systems",
  "Pixel Studio", "Northline Logistics", "Verve Health", "Kestrel Finance",
  "Loom Media", "Cobalt Analytics", "Harbor Goods", "Anonymous",
];

// Realistic feedback content across recurring themes — mirrors the
// variety the brief's Appendix A sample data shows (positive, negative,
// neutral, across topics like onboarding, billing, mobile, performance).
const FEEDBACK_CONTENT = [
  "Onboarding took forever — I couldn't figure out how to invite my team.",
  "The new dashboard is gorgeous and finally fast. Huge improvement.",
  "It does the job, but the mobile experience needs work.",
  "Prospect wants SSO before they'll sign — third time this month.",
  "Love the new export feature, saved me an hour today.",
  "Billing page keeps timing out when I try to download an invoice.",
  "Setup wizard is confusing — took three tries to connect our data source.",
  "Support responded within minutes, really impressed with the turnaround.",
  "Would love a dark mode option, staring at white screens all day is rough.",
  "The API documentation is out of date, cost us half a day debugging.",
  "Search is basically unusable once you have more than a few hundred items.",
  "Really appreciate how clean the reporting view is now.",
  "We almost churned because notifications kept spamming our whole team.",
  "Integration with our CRM broke again after the last update.",
  "Customer success team walked us through everything, great experience.",
  "Pricing page is confusing — not clear what's included in each tier.",
  "The new charts are exactly what our leadership team needed.",
  "Mobile app crashes every time I try to upload a photo.",
  "Finally, bulk actions in the inbox — this was badly needed.",
  "Two-factor login keeps failing on Android, had to disable it entirely.",
  "Whoever designed the empty states deserves a raise, very thoughtful.",
  "We need better permission granularity — admin or nothing feels too blunt.",
  "Load times have gotten noticeably worse over the past month.",
  "The Slack integration alone justified the upgrade for us.",
  "Still waiting on a reply to a ticket from over a week ago.",
  "Onboarding email sequence is clear and well paced, nice touch.",
  "Can't figure out how to export to PDF, docs don't mention it.",
  "Dashboard filters reset every time I navigate away, very annoying.",
  "The team loves the new commenting feature on reports.",
  "Billing support was rude and unhelpful when we asked about a refund.",
  "Really solid product overall, just wish the mobile app got more love.",
  "CSV import silently dropped half our rows with no error message.",
  "Great onboarding call, the rep actually understood our use case.",
  "Would pay more for a proper audit log — compliance keeps asking.",
  "The new homepage redesign is confusing, can't find settings anymore.",
  "Fast, reliable, does exactly what it says. No complaints.",
  "We need SAML support, currently blocking our enterprise rollout.",
  "Loving the weekly digest emails, keeps the whole team aligned.",
  "Trial expired without warning and we lost a day of testing.",
  "The new theme clustering feature saved us hours of manual tagging.",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithinLastDays(days: number): Date {
  const now = Date.now();
  const past = now - Math.random() * days * 24 * 60 * 60 * 1000;
  return new Date(past);
}

async function main() {
  // 1. Create the demo workspace
  const workspace = await prisma.workspace.create({
    data: { name: "Demo Workspace" },
  });

  // 2. Create one user per role
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@demo.com",
      passwordHash,
      role: "ADMIN",
      workspaceId: workspace.id,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Analyst User",
      email: "analyst@demo.com",
      passwordHash,
      role: "ANALYST",
      workspaceId: workspace.id,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Viewer User",
      email: "viewer@demo.com",
      passwordHash,
      role: "VIEWER",
      workspaceId: workspace.id,
    },
  });

  // 3. Create a handful of themes (AI will assign feedback to these in Week 3)
  const themeNames = [
    { name: "Onboarding", description: "Sign-up and setup experience", color: "#6366f1" },
    { name: "Billing", description: "Invoices, pricing, payments", color: "#ef4444" },
    { name: "Mobile Experience", description: "Mobile app usability and bugs", color: "#f59e0b" },
    { name: "Performance", description: "Speed, load times, reliability", color: "#10b981" },
    { name: "Integrations", description: "CRM, Slack, SSO, API", color: "#3b82f6" },
    { name: "Customer Support", description: "Support responsiveness and quality", color: "#8b5cf6" },
  ];

  const themes = [];
  for (const t of themeNames) {
    themes.push(await prisma.theme.create({ data: { ...t, workspaceId: workspace.id } }));
  }

  // 4. Bulk-generate 130 unclassified feedback items across all channels,
  // spread over the last 45 days. sentiment/sentimentScore left null —
  // AI classification (Week 3) fills these in, including backfilling this seed data.
  const TOTAL_ITEMS = 130;
  const feedbackData = Array.from({ length: TOTAL_ITEMS }).map(() => ({
    content: randomFrom(FEEDBACK_CONTENT),
    channel: randomFrom(CHANNELS),
    customerLabel: randomFrom(CUSTOMER_LABELS),
    status: "NEW" as const,
    workspaceId: workspace.id,
    createdAt: randomDateWithinLastDays(45),
  }));

  await prisma.feedback.createMany({ data: feedbackData });

  console.log("Seed complete:", {
    workspace: workspace.name,
    users: [admin.email, analyst.email, viewer.email],
    themes: themes.map((t) => t.name),
    feedbackItemsCreated: TOTAL_ITEMS,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });