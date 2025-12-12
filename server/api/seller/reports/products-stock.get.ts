import chromium from "@sparticuz/chromium";
import { desc, eq } from "drizzle-orm";
import puppeteer from "puppeteer-core";

import db from "~/lib/db";
import { categories, products } from "~/lib/db/schema";

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const seller = await sellerAuth.seller(event);
  if (!seller) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // Get all products for this seller ordered by stock (descending)
  const sellerProducts = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      stock: products.stock,
      price: products.price,
      rating: products.rating,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(eq(products.seller_id, seller.id))
    .orderBy(desc(products.stock));

  // Helper function to get stock status
  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { label: "Habis", color: "#ef4444" };
    if (stock < 2)
      return { label: "Sangat Rendah", color: "#f59e0b" };
    if (stock < 10)
      return { label: "Rendah", color: "#fb923c" };
    if (stock < 50)
      return { label: "Sedang", color: "#3b82f6" };
    return { label: "Baik", color: "#10b981" };
  };

  // Helper function to format rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Calculate statistics
  // const totalProducts = sellerProducts.length;
  // const totalStock = sellerProducts.reduce((sum, p) => sum + p.stock, 0);
  // const avgRating = totalProducts > 0
  //   ? (sellerProducts.reduce((sum, p) => sum + p.rating, 0) / totalProducts).toFixed(1)
  //   : "0.0";

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
        .stats {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          flex: 1;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          background-color: #f8fafc;
          border: 2px solid #e2e8f0;
        }
        .stat-card h3 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
          color: #667eea;
        }
        .stat-card p {
          margin: 5px 0 0 0;
          font-size: 14px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 11px;
        }
        th {
          background-color: #667eea;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:hover {
          background-color: #f7fafc;
        }
        .stock-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 10px;
          color: white;
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
        <h1>Laporan Produk Berdasarkan Stok</h1>
        <p>Diurutkan dari stok tertinggi ke terendah</p>
        <p>${config.public.siteName} - Dicetak pada ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })} oleh ${seller.picName}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 30%;">Produk</th>
            <th style="width: 20%;">Kategori</th>
            <th style="width: 20%;">Harga</th>
            <th style="width: 10%;">Rating</th>
            <th style="width: 15%;">Stok</th>
          </tr>
        </thead>
        <tbody>
          ${sellerProducts.map((product, index) => {
            const stockStatus = getStockStatus(product.stock);
            return `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${product.name}</strong></td>
                <td>${product.categoryName || "-"}</td>
                <td>${formatRupiah(product.price)}</td>
                <td>⭐ ${product.rating.toFixed(1)}</td>
                <td>
                  <span class="stock-badge" style="background-color: ${stockStatus.color};">
                    ${product.stock}
                  </span>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>

      <div class="footer">
        <p>Laporan ini digenerate otomatis oleh sistem ${config.public.siteName}</p>
      </div>
    </body>
    </html>
  `;

  // Generate PDF using Puppeteer
  const isProduction = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION;

  let browser;
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
        top: "15mm",
        right: "10mm",
        bottom: "15mm",
        left: "10mm",
      },
      printBackground: true,
    });

    await browser.close();

    setHeader(event, "Content-Type", "application/pdf");
    setHeader(event, "Content-Disposition", `attachment; filename="laporan-produk-stok-${Date.now()}.pdf"`);

    return pdfBuffer;
  }
  catch (error) {
    console.error("PDF Generation Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate PDF report",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
