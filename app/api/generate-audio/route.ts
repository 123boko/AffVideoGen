import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateAudio } from "@/lib/ai/elevenlabs";

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

    if (!project.aiVoiceOver) {
      return NextResponse.json(
        { error: "No voice over text available" },
        { status: 400 }
      );
    }

    const audioUrl = await generateAudio(project.aiVoiceOver, projectId);

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { audioUrl },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Audio generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
