import axios from "axios";
import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

export async function generateAudio(
  text: string,
  projectId: string
): Promise<string> {
  try {
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Default voice

    const response = await axios.post(
      `${ELEVENLABS_API_URL}/${voiceId}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "audio");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${projectId}-${Date.now()}.mp3`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, Buffer.from(response.data));

    return `/uploads/audio/${filename}`;
  } catch (error) {
    console.error("ElevenLabs error:", error);
    throw new Error("Failed to generate audio");
  }
}
