import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert content editor specialized in creating concise, insightful summaries. Follow these rules:
1. Generate 3-5 bullet points capturing key insights
2. Use clear, professional language
3. Maintain original meaning without distortion
4. Format with Markdown bullet points (-)
5. Keep each point under 20 words`;

export async function POST(req) {
  try {
    const { content } = await req.json();

    // Validate input
    if (!content?.trim() || content.trim().length < 100) {
      return NextResponse.json(
        { error: "Content must be at least 100 characters" },
        { status: 400 }
      );
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("Gemini API key not configured");
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`;

    const userPrompt = `Summarize this blog content into key insights:
"""
${content.trim()}
"""`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${SYSTEM_PROMPT}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,  // Lower for more factual accuracy
          maxOutputTokens: 300,
          topP: 0.8
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gemini API request failed");
    }

    const data = await response.json();
    const summaryText = data.candidates[0]?.content?.parts[0]?.text;

    if (!summaryText) {
      throw new Error("Empty summary response");
    }

    // Format the summary points
    const summaryPoints = summaryText
      .split("\n")
      .map((point) => point.replace(/^-/, "").trim())
      .filter((point) => point.length > 0);

    return NextResponse.json({
      summary: summaryPoints,
      wordCount: summaryPoints.join(" ").split(/\s+/).length,
    });

  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}