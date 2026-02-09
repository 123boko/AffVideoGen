"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Project {
  id: string;
  title: string;
  description: string;
  price: string | null;
  images: string[];
  status: string;
  aiCaption: string | null;
  aiDescription: string | null;
  aiHashtags: string[];
  aiVoiceOver: string | null;
  aiVideoPrompt: unknown;
  audioUrl: string | null;
  videoUrl: string | null;
}

export default function ProductEditor({ project }: { project: Project }) {
  const router = useRouter();
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [selectedImages, setSelectedImages] = useState(project.images);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [error, setError] = useState("");
  const [aiContent, setAiContent] = useState({
    caption: project.aiCaption,
    description: project.aiDescription,
    hashtags: project.aiHashtags,
    voiceOver: project.aiVoiceOver,
    videoPrompt: project.aiVideoPrompt,
  });
  const [audioUrl, setAudioUrl] = useState(project.audioUrl);
  const [videoUrl, setVideoUrl] = useState(project.videoUrl);

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, images: selectedImages }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      router.refresh();
    } catch (error) {
      setError("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const toggleImage = (image: string) => {
    setSelectedImages((prev) =>
      prev.includes(image) ? prev.filter((img) => img !== image) : [...prev, image]
    );
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      if (!res.ok) throw new Error("Failed to analyze");
      const data = await res.json();
      setAiContent({
        caption: data.aiCaption,
        description: data.aiDescription,
        hashtags: data.aiHashtags,
        voiceOver: data.aiVoiceOver,
        videoPrompt: data.aiVideoPrompt,
      });
    } catch {
      setError("Failed to generate AI content");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateAudio = async () => {
    setGeneratingAudio(true);
    setError("");
    try {
      const res = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      if (!res.ok) throw new Error("Failed to generate audio");
      const data = await res.json();
      setAudioUrl(data.audioUrl);
    } catch {
      setError("Failed to generate audio");
    } finally {
      setGeneratingAudio(false);
    }
  };

  const handleGenerateVideo = async () => {
    setGeneratingVideo(true);
    setError("");
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      if (!res.ok) throw new Error("Failed to generate video");
      const data = await res.json();
      setVideoUrl(data.videoUrl);
    } catch {
      setError("Failed to generate video");
    } finally {
      setGeneratingVideo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold">Edit Product</h1>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Product Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Product Images</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {project.images.map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={image}
                    alt={`Product ${index + 1}`}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                  <button
                    onClick={() => toggleImage(image)}
                    className={`absolute top-2 right-2 rounded-full px-3 py-1 text-xs ${
                      selectedImages.includes(image)
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {selectedImages.includes(image) ? "Selected" : "Removed"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-md bg-primary px-6 py-3 text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="rounded-md bg-blue-600 px-6 py-3 text-white hover:opacity-90 disabled:opacity-50"
            >
              {analyzing ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          {aiContent.caption && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">AI Generated Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Caption</label>
                  <p className="rounded-md bg-gray-50 p-3 text-sm">{aiContent.caption}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <p className="rounded-md bg-gray-50 p-3 text-sm whitespace-pre-wrap">{aiContent.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hashtags</label>
                  <div className="rounded-md bg-gray-50 p-3 text-sm flex flex-wrap gap-2">
                    {aiContent.hashtags.map((tag, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Voice Over Script</label>
                  <p className="rounded-md bg-gray-50 p-3 text-sm whitespace-pre-wrap">{aiContent.voiceOver}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Video Prompt</label>
                  <p className="rounded-md bg-gray-50 p-3 text-sm whitespace-pre-wrap">{typeof aiContent.videoPrompt === 'string' ? aiContent.videoPrompt : JSON.stringify(aiContent.videoPrompt, null, 2)}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleGenerateAudio}
                  disabled={generatingAudio || !aiContent.voiceOver}
                  className="rounded-md bg-green-600 px-6 py-3 text-white hover:opacity-90 disabled:opacity-50"
                >
                  {generatingAudio ? "Generating Audio..." : "Generate Audio"}
                </button>
                <button
                  onClick={handleGenerateVideo}
                  disabled={generatingVideo || !aiContent.videoPrompt}
                  className="rounded-md bg-purple-600 px-6 py-3 text-white hover:opacity-90 disabled:opacity-50"
                >
                  {generatingVideo ? "Generating Video..." : "Generate Video"}
                </button>
                <button
                  onClick={() => router.push(`/preview/${project.id}`)}
                  className="rounded-md bg-gray-600 px-6 py-3 text-white hover:opacity-90"
                >
                  Preview
                </button>
              </div>
            </div>
          )}

          {(audioUrl || videoUrl) && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">Generated Media</h2>
              <div className="space-y-4">
                {audioUrl && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Audio</label>
                    <audio controls className="w-full">
                      <source src={audioUrl} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
                {videoUrl && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Video</label>
                    <video controls className="w-full rounded-lg">
                      <source src={videoUrl} type="video/mp4" />
                    </video>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
