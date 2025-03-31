import { NextResponse } from "next/server";

const BLOG_GENERATION_PROMPT = `
You are a professional technical writer. Generate content with STRICT markdown formatting:

"""
Title: [Title Here]
Category: [Category Here]
Excerpt: [1-2 sentence summary]

[Content with PROPER markdown formatting]
"""

FORMATTING RULES:
1. Headings: ## for main sections, ### for sub-sections
2. Bold: **important terms** like **The Qubit Race**
3. Lists: 
   - Use - for unordered
   - 1. 2. for ordered
4. Code: \`\`\`language\ncode\n\`\`\`
5. Links: [text](url)
6. Paragraphs: Separate by \n\n
7. Blockquotes: > for quotes
`;

export async function POST(req) {
  try {
    const { topic, keywords = [] } = await req.json();

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${BLOG_GENERATION_PROMPT}\n\nWrite about: ${topic}\nKeywords to emphasize: ${keywords.join(
                  ", "
                )}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;

    if (!generatedText) {
      console.error("No content generated:", data);
      throw new Error("No content generated");
    }

    // Enhanced parsing with fallbacks
    const extractSection = (text, label) => {
      const regex = new RegExp(`${label}:\\s*([^\n]+)`);
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    };

    const title = extractSection(generatedText, "Title");
    const category = extractSection(generatedText, "Category");
    const excerpt = extractSection(generatedText, "Excerpt");
    const content = generatedText.split("\n\n").slice(3).join("\n\n").trim();

    // Ensure bold formatting exists for keywords
    const formattedContent = keywords.reduce((content, keyword) => {
      const boldPattern = new RegExp(`\\b${keyword}\\b`, "gi");
      return content.replace(boldPattern, `**${keyword}**`);
    }, content);

    if (!title || !category || !formattedContent) {
      console.error("Invalid format:", generatedText);
      throw new Error("Invalid response format");
    }

    return NextResponse.json({
      title,
      category,
      excerpt: excerpt || "",
      content: formattedContent,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        error: error.message || "Generation failed",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
      { status: 500 }
    );
  }
}
