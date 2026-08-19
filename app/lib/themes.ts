import { prisma } from "@/app/lib/db";

/**
 * Given a list of theme NAMES from an AI classification, find-or-create
 * each Theme in this workspace and link the feedback item to it.
 */
export async function linkFeedbackToThemes(
  feedbackId: string,
  themeNames: string[],
  workspaceId: string
) {
  for (const name of themeNames) {
    const theme = await prisma.theme.upsert({
      where: {
        // Requires a unique constraint on (workspaceId, name) — see note below
        workspaceId_name: { workspaceId, name },
      },
      update: {},
      create: { name, workspaceId },
    });

    await prisma.feedbackTheme.upsert({
      where: {
        feedbackId_themeId: { feedbackId, themeId: theme.id },
      },
      update: {},
      create: { feedbackId, themeId: theme.id, confidence: 0.8 },
    });
  }
}