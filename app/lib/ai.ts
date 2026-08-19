import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const classificationSchema = z.object({
  sentiment: z.enum(["POS", "NEU", "NEG"]),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()),
  featureArea: z.string(),
  rationale: z.string(),
});

export type ClassificationResult = z.infer<typeof classificationSchema>;

function stripMarkdownFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

async function callGemini(content: string, existingThemes: string[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const prompt = `You are classifying a piece of customer feedback for a product feedback platform.

Existing theme names (reuse one of these if it fits; only invent a new theme name if none apply):
${existingThemes.join(", ")}

Feedback to classify:
"${content}"

Return ONLY valid JSON, no markdown fences, no explanation outside the JSON, with exactly this shape:
{
  "sentiment": "POS" | "NEU" | "NEG",
  "sentimentScore": <number between -1 and 1>,
  "themes": [<one or more theme names as strings>],
  "featureArea": "<short label for what part of the product this concerns>",
  "rationale": "<one-line explanation of the classification>"
}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function classifyFeedback(
  content: string,
  existingThemes: string[]
): Promise<ClassificationResult | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callGemini(content, existingThemes);
      const cleaned = stripMarkdownFences(raw);
      const parsed = JSON.parse(cleaned);
      const result = classificationSchema.safeParse(parsed);

      if (result.success) {
        return result.data;
      }

      console.error(`Classification validation failed (attempt ${attempt + 1}):`, result.error);
    } catch (err) {
      console.error(`Classification attempt ${attempt + 1} failed:`, err);
    }
  }

  return null;
}
