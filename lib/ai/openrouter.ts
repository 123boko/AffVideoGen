import axios from "axios";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface AIResponse {
  caption: string;
  description: string;
  hashtags: string[];
  voiceOverText: string;
  videoPrompt: {
    scene_1: {
      visual: string;
      voice_over: string;
    };
    scene_2: {
      visual: string;
      voice_over: string;
    };
  };
}

export async function generateAIContent(
  title: string,
  description: string,
  images: string[]
): Promise<AIResponse> {
  const systemPrompt = `You are an expert affiliate marketing content creator. Generate viral, engaging content for social media that drives sales.

Your task: Create compelling marketing content for a product based on its details.

Output ONLY valid JSON in this exact format:
{
  "caption": "Viral caption/title (max 100 chars)",
  "description": "Engaging 1-2 paragraph description",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "voiceOverText": "Complete sales pitch voice over script",
  "videoPrompt": {
    "scene_1": {
      "visual": "Detailed visual description for scene 1",
      "voice_over": "Voice over script for scene 1"
    },
    "scene_2": {
      "visual": "Detailed visual description for scene 2",
      "voice_over": "Voice over script for scene 2"
    }
  }
}`;

  const userPrompt = `Product Title: ${title}

Product Description: ${description}

Number of Images: ${images.length}

Generate viral marketing content for this product.`;

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("OpenRouter error:", error);
    throw new Error("Failed to generate AI content");
  }
}
