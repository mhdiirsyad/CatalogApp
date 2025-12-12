import chromium from "@sparticuz/chromium";
import { and, eq, lt } from "drizzle-orm";
import puppeteer from "puppeteer-core";

import db from "~/lib/db";
import { categories, products } from "~/lib/db/schema";

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const seller = await sellerAuth.seller(event);
  if (!seller) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // Get products that need restocking (stock < 2)
  const restockProducts = await db
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
    .where(
      and(
        eq(products.seller_id, seller.id),
        lt(products.stock, 2),
      ),
    )
    .orderBy(categories.name, products.name); // Order by category then product name

  // Helper function to format rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Calculate statistics
  const totalRestockNeeded = restockProducts.length;
  // const outOfStock = restockProducts.filter(p => p.stock === 0).length;
  // const lowStock = restockProducts.filter(p => p.stock === 1).length;

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
          border-bottom: 3px solid #ef4444;
          padding-bottom: 15px;
        }
        .header h1 {
          color: #ef4444;
          margin: 0;
          font-size: 24px;
        }
        .header p {
          color: #666;
          margin: 5px 0 0 0;
        }
        .alert {
          background-color: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 30px;
          color: #991b1b;
        }
        .alert h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
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
        }
        .stat-card.total {
          background-color: #fee2e2;
          border: 2px solid #ef4444;
        }
        .stat-card.out {
          background-color: #fef2f2;
          border: 2px solid #dc2626;
        }
        .stat-card.low {
          background-color: #fef3c7;
          border: 2px solid #f59e0b;
        }
        .stat-card h3 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        .stat-card.total h3 { color: #ef4444; }
        .stat-card.out h3 { color: #dc2626; }
        .stat-card.low h3 { color: #f59e0b; }
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
          background-color: #ef4444;
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
          background-color: #fef2f2;
        }
        .priority {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 10px;
          color: white;
        }
        .priority.urgent {
          background-color: #dc2626;
        }
        .priority.high {
          background-color: #f59e0b;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 10px;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background-color: #f0fdf4;
          border: 2px solid #10b981;
          border-radius: 8px;
          margin: 20px 0;
        }
        .empty-state h2 {
          color: #10b981;
          margin: 0 0 10px 0;
        }
        .empty-state p {
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>⚠️ Laporan Produk Perlu Restock</h1>
        <p>Daftar produk dengan stok &lt; 2 unit</p>
        <p>${config.public.siteName} - Dicetak pada ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })} oleh ${seller.picName}</p>
      </div>

      ${totalRestockNeeded > 0
        ? `
          <div class="alert">
            <h3>⚠️ Peringatan!</h3>
            <p>Terdapat ${totalRestockNeeded} produk yang memerlukan restock segera untuk menghindari kehabisan stok.</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 35%;">Produk</th>
                <th style="width: 25%;">Kategori</th>
                <th style="width: 20%;">Harga</th>
                <th style="width: 15%;">Stock</th>
              </tr>
            </thead>
            <tbody>
              ${restockProducts.map((product, index) => {
                const priority = product.stock === 0
                  ? { label: "URGENT", class: "urgent" }
                  : { label: "HIGH", class: "high" };
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${product.name}</strong></td>
                    <td>${product.categoryName || "-"}</td>
                    <td>${formatRupiah(product.price)}</td>
                    <td>
                      <span class="priority ${priority.class}">
                        ${product.stock}
                      </span>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        `
        : `
          <div class="empty-state">
            <h2>✅ Semua Stok Aman!</h2>
            <p>Tidak ada produk yang memerlukan restock saat ini.</p>
            <p style="margin-top: 10px; font-size: 12px;">Semua produk memiliki stok ≥ 2 unit.</p>
          </div>
        `}

      <div class="footer">
        <p>Laporan ini digenerate otomatis oleh sistem ${config.public.siteName}</p>
        <p style="margin-top: 5px;">Rekomendasi: Segera lakukan pemesanan untuk produk dengan prioritas URGENT</p>
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
    setHeader(event, "Content-Disposition", `attachment; filename="laporan-produk-restock-${Date.now()}.pdf"`);

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
