import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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

  // 3. Create a couple of themes
  const onboardingTheme = await prisma.theme.create({
    data: {
      name: "Onboarding",
      description: "Feedback about the sign-up and setup experience",
      color: "#6366f1",
      workspaceId: workspace.id,
    },
  });

  // 4. Create one example feedback item
  const feedback = await prisma.feedback.create({
    data: {
      content: "Onboarding took forever — I couldn't figure out how to invite my team.",
      channel: "Support ticket",
      sentiment: "NEG",
      sentimentScore: -0.7,
      status: "NEW",
      workspaceId: workspace.id,
    },
  });

  // 5. Link that feedback to the theme
  await prisma.feedbackTheme.create({
    data: {
      feedbackId: feedback.id,
      themeId: onboardingTheme.id,
      confidence: 0.9,
    },
  });

  console.log("Seed complete:", { workspace, admin, analyst, viewer });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });