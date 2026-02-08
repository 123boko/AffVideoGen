import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { ScrapeResult } from "./shopee";

export async function scrapeTokopedia(url: string): Promise<ScrapeResult> {
  const logs: string[] = [];
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    logs.push(`[${timestamp}] ${message}`);
    console.log(`[Tokopedia Scraper] ${message}`);
  };

  log(`Starting scrape for URL: ${url}`);

  log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
    ],
  });
  log("Browser launched successfully");

  let screenshotPath: string | undefined;

  try {
    const page = await browser.newPage();
    log("New page created");

    const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";
    await page.setUserAgent(userAgent);
    log(`User agent set: ${userAgent.substring(0, 50)}...`);

    await page.setViewport({ width: 390, height: 844, isMobile: true });
    log("Viewport set to mobile (390x844)");

    await page.setExtraHTTPHeaders({
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    });
    log("Extra headers set (Indonesian language)");

    log(`Navigating to: ${url}`);
    const response = await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    log(`Page loaded with status: ${response?.status()}`);

    log("Waiting 3 seconds for dynamic content...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot
    log("Taking screenshot...");
    const screenshotDir = path.join(process.cwd(), "public", "uploads", "screenshots");
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshotFilename = `tokopedia-${Date.now()}.png`;
    const fullScreenshotPath = path.join(screenshotDir, screenshotFilename);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });
    screenshotPath = `/uploads/screenshots/${screenshotFilename}`;
    log(`Screenshot saved: ${screenshotPath}`);

    const pageTitle = await page.title();
    log(`Page title: ${pageTitle}`);

    const finalUrl = page.url();
    log(`Final URL: ${finalUrl}`);

    log("Extracting product data...");
    const data = await page.evaluate(() => {
      const title =
        document.querySelector("h1")?.textContent?.trim() ||
        document.querySelector('[data-testid="lblPDPDetailProductName"]')?.textContent?.trim() ||
        "";

      const description =
        document.querySelector('[data-testid="lblPDPDescriptionProduk"]')?.textContent?.trim() ||
        document.querySelector(".product-description")?.textContent?.trim() ||
        "";

      const price =
        document.querySelector('[data-testid="lblPDPDetailProductPrice"]')?.textContent?.trim() ||
        document.querySelector(".price")?.textContent?.trim() ||
        "";

      const images: string[] = [];
      document.querySelectorAll('[data-testid="PDPImageMain"] img, .product-media img, img[src*="tokopedia"]').forEach((img) => {
        const src = img.getAttribute("src") || img.getAttribute("data-src");
        if (src && !images.includes(src) && !src.includes("data:image")) {
          images.push(src);
        }
      });

      return { title, description, price, images };
    });

    log(`Title found: ${data.title || "(empty)"}`);
    log(`Description length: ${data.description.length} chars`);
    log(`Price found: ${data.price || "(empty)"}`);
    log(`Images found: ${data.images.length}`);

    return {
      ...data,
      screenshot: screenshotPath,
      logs,
    };
  } catch (error) {
    log(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  } finally {
    log("Closing browser...");
    await browser.close();
    log("Browser closed");
  }
}
