"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type InputMode = "scrape" | "manual";

interface ScrapeResult {
  projectId?: string;
  screenshot?: string;
  logs?: string[];
  error?: string;
  errorDetail?: string;
  data?: {
    title: string;
    description: string;
    price: string;
    imagesCount: number;
  };
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>("scrape");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Scrape mode state
  const [url, setUrl] = useState("");
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);

  // Manual mode state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrls, setImageUrls] = useState("");

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setScrapeResult(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data: ScrapeResult = await res.json();
      setScrapeResult(data);

      if (!res.ok) {
        setError(data.error || "Failed to scrape product");
        return;
      }

      // Auto redirect after 3 seconds if successful
      if (data.projectId) {
        setTimeout(() => {
          router.push(`/editor/${data.projectId}`);
        }, 3000);
      }
    } catch (err) {
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
      const images = imageUrls
        .split(/[,\n]/)
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const res = await fetch("/api/projects/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price, images }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create project");
        return;
      }

      const data = await res.json();
      router.push(`/editor/${data.projectId}`);
    } catch (err) {
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

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="rounded-lg bg-white p-6 shadow">
            {/* Tab Switcher */}
            <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => { setMode("scrape"); setScrapeResult(null); }}
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
                onClick={() => { setMode("manual"); setScrapeResult(null); }}
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
              <form onSubmit={handleManualSubmit} className="space-y-4">
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
                    rows={4}
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
                    Image URLs (one per line)
                  </label>
                  <textarea
                    id="imageUrls"
                    rows={3}
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                    placeholder="https://example.com/image1.jpg"
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

          {/* Right Column - Results */}
          <div className="space-y-4">
            {/* Scrape Result Data */}
            {scrapeResult?.data && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="font-semibold mb-3 text-green-600">Scrape Successful!</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Title:</span> {scrapeResult.data.title || "(empty)"}</p>
                  <p><span className="font-medium">Price:</span> {scrapeResult.data.price || "(empty)"}</p>
                  <p><span className="font-medium">Images:</span> {scrapeResult.data.imagesCount} found</p>
                  <p className="text-gray-500 mt-3">Redirecting to editor in 3 seconds...</p>
                </div>
              </div>
            )}

            {/* Screenshot */}
            {scrapeResult?.screenshot && (
              <div className="rounded-lg bg-white p-4 shadow">
                <h3 className="font-semibold mb-3">Screenshot</h3>
                <div className="relative w-full h-64 border rounded overflow-hidden">
                  <Image
                    src={scrapeResult.screenshot}
                    alt="Scraped page screenshot"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* Logs */}
            {scrapeResult?.logs && scrapeResult.logs.length > 0 && (
              <div className="rounded-lg bg-gray-900 p-4 shadow">
                <h3 className="font-semibold mb-3 text-white">Scrape Logs</h3>
                <div className="h-64 overflow-y-auto font-mono text-xs text-green-400 space-y-1">
                  {scrapeResult.logs.map((log, i) => (
                    <div key={i} className="break-all">{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Detail */}
            {scrapeResult?.errorDetail && (
              <div className="rounded-lg bg-red-900 p-4 shadow">
                <h3 className="font-semibold mb-2 text-white">Error Detail</h3>
                <p className="text-red-200 text-sm">{scrapeResult.errorDetail}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
