"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InputMode = "scrape" | "manual";

export default function CreateProjectPage() {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>("scrape");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Scrape mode state
  const [url, setUrl] = useState("");

  // Manual mode state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrls, setImageUrls] = useState("");

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to scrape product");
        return;
      }

      const data = await res.json();
      router.push(`/editor/${data.projectId}`);
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Parse image URLs (comma or newline separated)
      const images = imageUrls
        .split(/[,\n]/)
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const res = await fetch("/api/projects/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price,
          images,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create project");
        return;
      }

      const data = await res.json();
      router.push(`/editor/${data.projectId}`);
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold">Create New Project</h1>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg bg-white p-8 shadow">
          {/* Tab Switcher */}
          <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode("scrape")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                mode === "scrape"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Scrape URL
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                mode === "manual"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Input Manual
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Scrape Mode Form */}
          {mode === "scrape" && (
            <form onSubmit={handleScrape} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-medium mb-2">
                  Product URL (Shopee or Tokopedia)
                </label>
                <input
                  id="url"
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://shopee.co.id/..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-3 text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Scraping product..." : "Scrape & Create Project"}
              </button>
            </form>
          )}

          {/* Manual Mode Form */}
          {mode === "manual" && (
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Product Title *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter product title"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Product Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-2">
                  Price (optional)
                </label>
                <input
                  id="price"
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Rp 100.000"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="imageUrls" className="block text-sm font-medium mb-2">
                  Image URLs (one per line or comma separated)
                </label>
                <textarea
                  id="imageUrls"
                  rows={4}
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-3 text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Creating project..." : "Create Project"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
