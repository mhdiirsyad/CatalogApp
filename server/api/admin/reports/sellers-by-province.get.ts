import chromium from "@sparticuz/chromium";
import { desc, gte } from "drizzle-orm";
import puppeteer from "puppeteer-core";

import db from "~/lib/db";
import { sellers } from "~/lib/db/schema";

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

  const whereClause = dateFilter ? gte(sellers.createdAt, dateFilter) : undefined;

  // Get all sellers grouped by province with details
  const allSellers = await db
    .select({
      id: sellers.id,
      storeName: sellers.storeName,
      picName: sellers.picName,
      picEmail: sellers.picEmail,
      picHp: sellers.picHp,
      picProvince: sellers.picProvince,
      picCity: sellers.picCity,
      picDistrict: sellers.picDistrict,
      status: sellers.status,
      createdAt: sellers.createdAt,
    })
    .from(sellers)
    .where(whereClause)
    .orderBy(sellers.picProvince, desc(sellers.createdAt));

  // Group by province
  const provinceGroups = allSellers.reduce((acc, seller) => {
    const province = seller.picProvince;
    if (!acc[province]) {
      acc[province] = [];
    }
    acc[province].push(seller);
    return acc;
  }, {} as Record<string, typeof allSellers>);

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
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section h2 {
          color: #667eea;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 15px;
          font-size: 16px;
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
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 600;
        }
        .status-active {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status-cancelled {
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
        <h1>Laporan Daftar Toko Berdasarkan Lokasi Provinsi</h1>
        <p>Periode: ${period === "1d" ? "1 Hari Terakhir" : period === "7d" ? "7 Hari Terakhir" : period === "30d" ? "30 Hari Terakhir" : "Semua Waktu"}</p>
        <p>${config.public.siteName} - Dicetak pada ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })} oleh ${(session.user as any).username}</p>
      </div>


      ${Object.entries(provinceGroups).map(([province, sellers]) => `
        <div class="section">
          <h2>${province} (${sellers.length} seller)</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 35%;">Nama Toko</th>
                <th style="width: 30%;">Nama PIC</th>
                <th style="width: 30%;">Provinsi</th>
              </tr>
            </thead>
            <tbody>
              ${sellers.map((seller, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${seller.storeName}</td>
                  <td>${seller.picName}</td>
                  <td>${seller.picProvince}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `).join("")}

      <div class="footer">
        <p>Laporan ini digenerate otomatis oleh sistem ${config.public.siteName}</p>
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
