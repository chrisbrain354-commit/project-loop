import { withAuth } from "@/app/lib/auth-helpers";
import { prisma } from "@/app/lib/db";
import { embedText, cosineSimilarity } from "@/app/lib/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  return withAuth(["ADMIN", "ANALYST", "VIEWER"], async ({ workspaceId }) => {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return { answer: "Please provide a question.", sources: [] };
    }

    const questionVector = await embedText(question);

    const embeddings = await prisma.embedding.findMany({
      where: { feedback: { workspaceId } },
      include: { feedback: true },
    });

    const ranked = embeddings
      .map((e) => ({
        feedback: e.feedback,
        score: cosineSimilarity(questionVector, e.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (ranked.length === 0) {
      return {
        answer: "There isn't enough feedback data yet to answer that.",
        sources: [],
      };
    }

    const context = ranked
      .map((r, i) => `[${i + 1}] "${r.feedback.content}" (channel: ${r.feedback.channel})`)
      .join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    const prompt = `Answer the question using ONLY the feedback items below. If the answer isn't in these items, say so clearly. Cite items by their [number].

Feedback:
${context}

Question: ${question}

Answer:`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return {
      answer,
      sources: ranked.map((r) => ({
        id: r.feedback.id,
        content: r.feedback.content,
        channel: r.feedback.channel,
      })),
    };
  });
}