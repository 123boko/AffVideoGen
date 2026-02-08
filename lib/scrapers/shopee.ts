import puppeteer from "puppeteer";

export async function scrapeShopee(url: string) {
  // Convert to mobile URL if needed
  const mobileUrl = url.replace("shopee.co.id", "m.shopee.co.id");

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

  try {
    const page = await browser.newPage();

    // Set mobile user agent (iPhone)
    await page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
    );

    // Set mobile viewport
    await page.setViewport({ width: 390, height: 844, isMobile: true });

    // Set extra headers
    await page.setExtraHTTPHeaders({
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    });

    // Navigate to page
    await page.goto(mobileUrl, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

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
            // Get higher resolution image
            src = src.replace(/_tn(\.\w+)$/, "$1");
            images.push(src);
          }
        });
      });

      return { title, description, price, images };
    });

    return data;
  } finally {
    await browser.close();
  }
}
