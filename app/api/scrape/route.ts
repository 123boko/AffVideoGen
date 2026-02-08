import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scrapeShopee } from "@/lib/scrapers/shopee";
import { scrapeTokopedia } from "@/lib/scrapers/tokopedia";

export async function POST(req: Request) {
  const logs: string[] = [];
  const log = (msg: string) => logs.push(`[${new Date().toISOString()}] ${msg}`);

  try {
    log("Starting scrape request...");

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      log("Error: Unauthorized");
      return NextResponse.json({ error: "Unauthorized", logs }, { status: 401 });
    }
    log(`User authenticated: ${session.user.email}`);

    const { url } = await req.json();
    log(`URL received: ${url}`);

    if (!url) {
      log("Error: URL is required");
      return NextResponse.json({ error: "URL is required", logs }, { status: 400 });
    }

    let marketplace = "";
    let scrapedData;

    if (url.includes("shopee")) {
      marketplace = "shopee";
      log("Detected marketplace: Shopee");
      scrapedData = await scrapeShopee(url);
    } else if (url.includes("tokopedia")) {
      marketplace = "tokopedia";
      log("Detected marketplace: Tokopedia");
      scrapedData = await scrapeTokopedia(url);
    } else {
      log("Error: Unsupported marketplace");
      return NextResponse.json(
        { error: "Unsupported marketplace. Only Shopee and Tokopedia are supported.", logs },
        { status: 400 }
      );
    }

    // Combine logs
    const allLogs = [...logs, ...scrapedData.logs];

    log("Creating project in database...");
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        productUrl: url,
        marketplace,
        title: scrapedData.title,
        description: scrapedData.description,
        price: scrapedData.price,
        images: scrapedData.images,
        aiHashtags: [],
        status: "draft",
      },
    });
    allLogs.push(`[${new Date().toISOString()}] Project created with ID: ${project.id}`);

    return NextResponse.json({
      projectId: project.id,
      screenshot: scrapedData.screenshot,
      logs: allLogs,
      data: {
        title: scrapedData.title,
        description: scrapedData.description,
        price: scrapedData.price,
        imagesCount: scrapedData.images.length,
      }
    }, { status: 201 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    log(`Error: ${errorMsg}`);
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Failed to scrape product", logs, errorDetail: errorMsg },
      { status: 500 }
    );
  }
}
