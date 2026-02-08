import puppeteer from "puppeteer";

export async function scrapeTokopedia(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForSelector("h1", { timeout: 10000 });

    const data = await page.evaluate(() => {
      const title = document.querySelector("h1")?.textContent?.trim() || "";
      const description =
        document.querySelector('[data-testid="lblPDPDescriptionProduk"]')?.textContent?.trim() ||
        document.querySelector(".product-description")?.textContent?.trim() ||
        "";
      const priceElement = document.querySelector('[data-testid="lblPDPDetailProductPrice"]') ||
        document.querySelector(".price");
      const price = priceElement?.textContent?.trim() || "";

      const imageElements = document.querySelectorAll(
        '[data-testid="PDPImageMain"] img, .product-media img'
      );
      const images: string[] = [];
      imageElements.forEach((img) => {
        const src = img.getAttribute("src");
        if (src && !images.includes(src)) {
          images.push(src);
        }
      });

      return { title, description, price, images };
    });

    return data;
  } finally {
    await browser.close();
  }
}
