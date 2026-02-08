import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PreviewContent from "@/components/preview/PreviewContent";

export default async function PreviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
  });

  if (!project || project.userId !== session.user.id) {
    notFound();
  }

  return <PreviewContent project={project} />;
}
