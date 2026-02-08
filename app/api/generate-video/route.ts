import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateVideo } from "@/lib/ai/video-generator";

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

    if (!project.aiVideoPrompt) {
      return NextResponse.json(
        { error: "No video prompt available" },
        { status: 400 }
      );
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "processing" },
    });

    const videoUrl = await generateVideo(project.aiVideoPrompt, projectId);

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { videoUrl, status: "completed" },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}
