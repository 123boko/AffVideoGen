import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateAIContent } from "@/lib/ai/openrouter";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await req.json();

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const aiContent = await generateAIContent(
      project.title,
      project.description,
      project.images
    );

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        aiCaption: aiContent.caption,
        aiDescription: aiContent.description,
        aiHashtags: aiContent.hashtags,
        aiVoiceOver: aiContent.voiceOverText,
        aiVideoPrompt: aiContent.videoPrompt,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze product" },
      { status: 500 }
    );
  }
}
