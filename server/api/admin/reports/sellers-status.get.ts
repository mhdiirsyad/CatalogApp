import { desc, gte } from "drizzle-orm";
import puppeteer from "puppeteer";

import db from "~/lib/db";
import { sellers } from "~/lib/db/schema";

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

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

  // Get all sellers with their status
  const allSellers = await db
    .select({
      id: sellers.id,
      storeName: sellers.storeName,
      picName: sellers.picName,
      picEmail: sellers.picEmail,
      picHp: sellers.picHp,
      picProvince: sellers.picProvince,
      picCity: sellers.picCity,
      status: sellers.status,
      verifiedAt: sellers.verifiedAt,
      createdAt: sellers.createdAt,
    })
    .from(sellers)
    .where(whereClause)
    .orderBy(desc(sellers.createdAt));

  // Separate active and inactive sellers
  const activeSellers = allSellers.filter(s => s.status === "APPROVED");
  const inactiveSellers = allSellers.filter(s => s.status !== "APPROVED");

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
          margin-bottom: 40px;
        }
        .section h2 {
          color: #667eea;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 15px;
          font-size: 18px;
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
        .stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .stat-card {
          flex: 1;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-card.active {
          background-color: #d1fae5;
          border: 2px solid #10b981;
        }
        .stat-card.inactive {
          background-color: #fee2e2;
          border: 2px solid #ef4444;
        }
        .stat-card h3 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        .stat-card.active h3 {
          color: #10b981;
        }
        .stat-card.inactive h3 {
          color: #ef4444;
        }
        .stat-card p {
          margin: 5px 0 0 0;
          font-size: 14px;
          color: #666;
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
        <h1>Laporan Status Akun Seller</h1>
        <p>Periode: ${period === "1d" ? "1 Hari Terakhir" : period === "7d" ? "7 Hari Terakhir" : period === "30d" ? "30 Hari Terakhir" : "Semua Waktu"}</p>
        <p>CatalogApp - Dicetak pada ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}</p>
      </div>

      <div class="stats">
        <div class="stat-card active">
          <h3>${activeSellers.length}</h3>
          <p>Seller Aktif</p>
        </div>
        <div class="stat-card inactive">
          <h3>${inactiveSellers.length}</h3>
          <p>Seller Nonaktif</p>
        </div>
      </div>

      <div class="section">
        <h2>Daftar Seller Aktif (${activeSellers.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Toko</th>
              <th>Nama PIC</th>
              <th>Email</th>
              <th>No. HP</th>
              <th>Provinsi</th>
              <th>Kota</th>
              <th>Tanggal Verifikasi</th>
            </tr>
          </thead>
          <tbody>
            ${activeSellers.map(seller => `
              <tr>
                <td>${seller.id}</td>
                <td>${seller.storeName}</td>
                <td>${seller.picName}</td>
                <td>${seller.picEmail}</td>
                <td>${seller.picHp}</td>
                <td>${seller.picProvince}</td>
                <td>${seller.picCity}</td>
                <td>${seller.verifiedAt ? new Date(seller.verifiedAt).toLocaleDateString("id-ID") : "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Daftar Seller Nonaktif (${inactiveSellers.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Toko</th>
              <th>Nama PIC</th>
              <th>Email</th>
              <th>No. HP</th>
              <th>Provinsi</th>
              <th>Kota</th>
              <th>Status</th>
              <th>Tanggal Daftar</th>
            </tr>
          </thead>
          <tbody>
            ${inactiveSellers.map(seller => `
              <tr>
                <td>${seller.id}</td>
                <td>${seller.storeName}</td>
                <td>${seller.picName}</td>
                <td>${seller.picEmail}</td>
                <td>${seller.picHp}</td>
                <td>${seller.picProvince}</td>
                <td>${seller.picCity}</td>
                <td>${seller.status === "PENDING" ? "Pending" : "Dibatalkan"}</td>
                <td>${new Date(seller.createdAt).toLocaleDateString("id-ID")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>Laporan ini digenerate otomatis oleh sistem CatalogApp</p>
      </div>
    </body>
    </html>
  `;

  // Generate PDF using Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html);

  const pdfBuffer = await page.pdf({
    format: "A4",
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
  setHeader(event, "Content-Disposition", `attachment; filename="laporan-seller-status-${Date.now()}.pdf"`);

  return pdfBuffer;
});
