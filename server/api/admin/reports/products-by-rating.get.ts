import chromium from "@sparticuz/chromium";
import { desc, eq, gte } from "drizzle-orm";
import puppeteer from "puppeteer-core";

import db from "~/lib/db";
import { categories, products, reviews, sellers } from "~/lib/db/schema";

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  // Get period from query params (default: all)
  const query = getQuery(event);
  const period = query.period as string || "all";

  // Calculate timestamp based on period
  let dateFilter;
  const now = Date.now();
  if (period === "1d") {
    dateFilter = now - (24 * 60 * 60 * 1000);
  }
  else if (period === "7d") {
    dateFilter = now - (7 * 24 * 60 * 60 * 1000);
  }
  else if (period === "30d") {
    dateFilter = now - (30 * 24 * 60 * 60 * 1000);
  }

  const whereClause = dateFilter ? gte(reviews.createdAt, dateFilter) : undefined;

  // Get all reviews with product info, seller info, and category
  const allProducts = await db
    .select({
      reviewId: reviews.id,
      productId: products.id,
      name: products.name,
      rating: reviews.rating,
      price: products.price,
      stock: products.stock,
      categoryName: categories.name,
      storeName: sellers.storeName,
      reviewProvince: reviews.province,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.product_id, products.id))
    .leftJoin(categories, eq(products.category_id, categories.id))
    .leftJoin(sellers, eq(products.seller_id, sellers.id))
    .where(whereClause)
    .orderBy(desc(reviews.rating), desc(reviews.createdAt));

  // Calculate statistics
  const totalReviews = allProducts.length;
  const _avgRating = totalReviews > 0 ? allProducts.reduce((sum, p) => sum + p.rating, 0) / totalReviews : 0;
  const _highRatedProducts = allProducts.filter(p => p.rating >= 4).length;
  const _lowRatedProducts = allProducts.filter(p => p.rating < 3).length;

  // Generate HTML content for PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #667eea;
          padding-bottom: 15px;
        }
        .header h1 {
          color: #667eea;
          margin: 0;
          font-size: 24px;
        }
        .header p {
          color: #666;
          margin: 5px 0 0 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          background-color: #f0f4ff;
          border: 2px solid #667eea;
        }
        .stat-card h3 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #667eea;
        }
        .stat-card p {
          margin: 5px 0 0 0;
          font-size: 11px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 10px;
        }
        th {
          background-color: #667eea;
          color: white;
          padding: 8px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 6px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:hover {
          background-color: #f7fafc;
        }
        .rating {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 10px;
        }
        .rating-high {
          background-color: #d1fae5;
          color: #065f46;
        }
        .rating-medium {
          background-color: #fef3c7;
          color: #92400e;
        }
        .rating-low {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 10px;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Laporan Daftar Produk Berdasarkan Rating</h1>
        <p>Periode: ${period === "1d" ? "1 Hari Terakhir" : period === "7d" ? "7 Hari Terakhir" : period === "30d" ? "30 Hari Terakhir" : "Semua Waktu"}</p>
        <p>${config.public.siteName} - Dicetak pada ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })} oleh ${(session.user as any).username}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 25%;">Produk</th>
            <th style="width: 15%;">Kategori</th>
            <th style="width: 15%;">Harga</th>
            <th style="width: 10%;">Rating</th>
            <th style="width: 15%;">Nama Toko</th>
            <th style="width: 15%;">Provinsi</th>
          </tr>
        </thead>
        <tbody>
          ${allProducts.map((product, index) => {
            const ratingClass = product.rating >= 4 ? "rating-high" : (product.rating >= 3 ? "rating-medium" : "rating-low");
            const formattedPrice = new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(product.price);
            return `
              <tr>
                <td>${index + 1}</td>
                <td>${product.name}</td>
                <td>${product.categoryName || "-"}</td>
                <td>${formattedPrice}</td>
                <td><span class="rating ${ratingClass}">${product.rating.toFixed(1)} ⭐</span></td>
                <td>${product.storeName || "-"}</td>
                <td>${product.reviewProvince || "-"}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>

      <div class="footer">
        <p>Laporan ini digenerate otomatis oleh sistem ${config.public.siteName} • Total ${totalReviews} review dari pembeli</p>
      </div>
    </body>
    </html>
  `;

  const isProduction = process.env.VERCEL;
  let browser;
  // Generate PDF using Puppeteer

  try {
    if (isProduction) {
      chromium.setGraphicsMode = false;
      browser = await puppeteer.launch({
        args: [...chromium.args, "--disable-gpu"],
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }
    else {
      // Use local Chrome for development
      const puppeteerFull = await import("puppeteer").then(m => m.default);
      browser = await puppeteerFull.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
      printBackground: true,
    });
    await browser.close();

    // Set response headers for PDF download
    setHeader(event, "Content-Type", "application/pdf");
    setHeader(event, "Content-Disposition", `attachment; filename="laporan-produk-berdasarkan-rating-${Date.now()}.pdf"`);

    return pdfBuffer;
  }
  catch (e) {
    const error = e as Error;
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: `Gagal mengunduh laporan, ${error.message}`,
    }));
  }
});
