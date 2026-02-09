import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export interface ScrapeResult {
  title: string;
  description: string;
  price: string;
  images: string[];
  screenshot?: string;
  logs: string[];
}

export async function scrapeShopee(url: string): Promise<ScrapeResult> {
  const logs: string[] = [];
  const log = (message: string) => {
    const timestamp = new Date().toISOString();
    logs.push(`[${timestamp}] ${message}`);
    console.log(`[Shopee Scraper] ${message}`);
  };

  log(`Starting scrape for URL: ${url}`);

  // Convert to mobile URL if needed
  const mobileUrl = url.replace("shopee.co.id", "m.shopee.co.id");
  log(`Converted to mobile URL: ${mobileUrl}`);

  log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    protocolTimeout: 180000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--disable-gpu",
      "--single-process",
    ],
  });
  log("Browser launched successfully");

  let screenshotPath: string | undefined;

  try {
    const page = await browser.newPage();
    log("New page created");

    // Set mobile user agent (iPhone)
    const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";
    await page.setUserAgent(userAgent);
    log(`User agent set: ${userAgent.substring(0, 50)}...`);

    // Set mobile viewport
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    log("Viewport set to mobile (390x844)");

    // Set extra headers
    await page.setExtraHTTPHeaders({
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    });
    log("Extra headers set (Indonesian language)");

    // Navigate to page
    log(`Navigating to: ${mobileUrl}`);
    const response = await page.goto(mobileUrl, { waitUntil: "networkidle2", timeout: 60000 });
    log(`Page loaded with status: ${response?.status()}`);

    // Wait for content to load
    log("Waiting 3 seconds for dynamic content...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot
    log("Taking screenshot...");
    const screenshotDir = path.join(process.cwd(), "public", "uploads", "screenshots");
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshotFilename = `shopee-${Date.now()}.png`;
    const fullScreenshotPath = path.join(screenshotDir, screenshotFilename);
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });
    screenshotPath = `/uploads/screenshots/${screenshotFilename}`;
    log(`Screenshot saved: ${screenshotPath}`);

    // Get page title for debugging
    const pageTitle = await page.title();
    log(`Page title: ${pageTitle}`);

    // Get page URL after any redirects
    const finalUrl = page.url();
    log(`Final URL: ${finalUrl}`);

    log("Extracting product data...");
    const data = await page.evaluate(() => {
      // Try multiple selectors for title
      const title =
        document.querySelector(".product-briefing h1")?.textContent?.trim() ||
        document.querySelector("[data-sqe='name']")?.textContent?.trim() ||
        document.querySelector(".WBVL_7")?.textContent?.trim() ||
        document.querySelector("h1")?.textContent?.trim() ||
        document.querySelector(".product-name")?.textContent?.trim() ||
        "";

      // Try multiple selectors for description
      const description =
        document.querySelector(".product-detail")?.textContent?.trim() ||
        document.querySelector("[data-sqe='description']")?.textContent?.trim() ||
        document.querySelector(".f7AU53")?.textContent?.trim() ||
        "";

      // Try multiple selectors for price
      const price =
        document.querySelector(".product-briefing .price")?.textContent?.trim() ||
        document.querySelector("[data-sqe='price']")?.textContent?.trim() ||
        document.querySelector(".YQRJF5")?.textContent?.trim() ||
        document.querySelector(".pqTWkA")?.textContent?.trim() ||
        "";

      // Get images from various sources
      const images: string[] = [];
      const imageSelectors = [
        ".product-briefing img",
        "[data-sqe='image'] img",
        ".carousel img",
        ".image-carousel img",
        "img[src*='shopee']",
      ];

      imageSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((img) => {
          let src = img.getAttribute("src") || img.getAttribute("data-src");
          if (src && !images.includes(src) && !src.includes("data:image")) {
            src = src.replace(/_tn(\.\w+)$/, "$1");
            images.push(src);
          }
        });
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
