"use client";

import Link from "next/link";

interface Project {
  id: string;
  title: string;
  aiCaption: string | null;
  aiDescription: string | null;
  aiHashtags: string[];
  videoUrl: string | null;
  status: string;
}

export default function PreviewContent({ project }: { project: Project }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold">Preview</h1>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          {project.videoUrl && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">Generated Video</h2>
              <video controls className="w-full rounded-lg">
                <source src={project.videoUrl} type="video/mp4" />
              </video>
            </div>
          )}

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">AI-Generated Content</h2>
            <div className="space-y-4">
              {project.aiCaption && (
                <div>
                  <h3 className="font-medium mb-2">Caption</h3>
                  <p className="text-gray-700">{project.aiCaption}</p>
                </div>
              )}
              {project.aiDescription && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-700">{project.aiDescription}</p>
                </div>
              )}
              {project.aiHashtags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Hashtags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.aiHashtags.map((tag, i) => (
                      <span key={i} className="rounded-full bg-blue-100 px-3 py-1 text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href={`/editor/${project.id}`}
              className="rounded-md bg-secondary px-6 py-3 text-secondary-foreground hover:opacity-90"
            >
              Back to Editor
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md bg-primary px-6 py-3 text-white hover:opacity-90"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
