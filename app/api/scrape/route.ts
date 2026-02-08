import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { scrapeShopee } from "@/lib/scrapers/shopee";
import { scrapeTokopedia } from "@/lib/scrapers/tokopedia";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let marketplace = "";
    let scrapedData;

    if (url.includes("shopee")) {
      marketplace = "shopee";
      scrapedData = await scrapeShopee(url);
    } else if (url.includes("tokopedia")) {
      marketplace = "tokopedia";
      scrapedData = await scrapeTokopedia(url);
    } else {
      return NextResponse.json(
        { error: "Unsupported marketplace. Only Shopee and Tokopedia are supported." },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ projectId: project.id }, { status: 201 });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Failed to scrape product" },
      { status: 500 }
    );
  }
}
