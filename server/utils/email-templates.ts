const config = useRuntimeConfig();

export type EmailTemplate = {
  to: string;
  subject: string;
  html: string;
};

export function getSellerApprovedEmailTemplate(
  sellerName: string,
  storeName: string,
  email: string,
): EmailTemplate {
  return {
    to: email,
    subject: `🎉 Selamat! Registrasi Toko "${storeName}" Telah Disetujui`,
    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registrasi Disetujui</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; background-color: #f4f4f4;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ✅ Registrasi Disetujui!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Halo <strong>${sellerName}</strong>,
              </p>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Selamat! Kami dengan senang hati mengumumkan bahwa registrasi toko Anda <strong>"${storeName}"</strong> telah <strong style="color: #10b981;">disetujui</strong> oleh tim kami.
              </p>

              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px; color: #065f46; font-size: 14px; font-weight: bold;">
                  ✨ Anda sekarang dapat:
                </p>
                <ul style="margin: 10px 0 0; padding-left: 20px; color: #065f46; font-size: 14px; line-height: 1.8;">
                  <li>Login ke dashboard seller</li>
                  <li>Menambah dan mengelola produk</li>
                  <li>Mengelola profil toko Anda</li>
                </ul>
              </div>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Silakan login menggunakan email dan password yang Anda daftarkan untuk mulai mengelola toko Anda.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0; display: flex; align-items: center; justify-content: center;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${config.public.appPublicUrl || "http://localhost:3000"}/seller/auth/login"
                       style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Login ke Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi tim support kami.
              </p>

              <p style="margin: 20px 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Terima kasih telah bergabung dengan kami!
              </p>

              <p style="margin: 10px 0 0; color: #666666; font-size: 14px;">
                Salam,<br>
                <strong>Tim CatalogApp</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                Email ini dikirim otomatis oleh sistem. Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}

export function getSellerRejectedEmailTemplate(
  sellerName: string,
  storeName: string,
  email: string,
): EmailTemplate {
  return {
    to: email,
    subject: `Informasi Registrasi Toko "${storeName}"`,
    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informasi Registrasi</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; background-color: #f4f4f4;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ℹ️ Informasi Registrasi
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Halo <strong>${sellerName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Terima kasih atas minat Anda untuk bergabung sebagai seller di platform kami.
              </p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                  Setelah melakukan review terhadap registrasi toko <strong>"${storeName}"</strong>, kami dengan menyesal harus menginformasikan bahwa registrasi Anda <strong>tidak dapat kami proses</strong> saat ini.
                </p>
              </div>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Kemungkinan alasan penolakan:
              </p>
              
              <ul style="margin: 0 0 20px; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                <li>Informasi yang diberikan tidak lengkap atau tidak sesuai</li>
                <li>Dokumen yang diunggah tidak jelas atau tidak valid</li>
                <li>Duplikasi data atau akun yang sudah terdaftar</li>
                <li>Tidak memenuhi persyaratan yang ditetapkan</li>
              </ul>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <strong>💡 Saran:</strong> Anda dapat melakukan registrasi ulang dengan memastikan semua informasi dan dokumen yang diperlukan telah lengkap dan sesuai dengan persyaratan.
                </p>
              </div>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Jika Anda memiliki pertanyaan atau memerlukan klarifikasi lebih lanjut mengenai keputusan ini, silakan hubungi tim support kami.
              </p>
              
              <p style="margin: 30px 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Terima kasih atas pengertian Anda.
              </p>
              
              <p style="margin: 10px 0 0; color: #666666; font-size: 14px;">
                Salam,<br>
                <strong>Tim CatalogApp</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                Email ini dikirim otomatis oleh sistem. Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}

export function sendReviewEmailTemplate(email: string, reviewer: string): EmailTemplate {
  return {
    to: email,
    subject: `Terimakasih ${reviewer}`,
    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terimakasih</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center; background-color: #f4f4f4;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ✅ Registrasi Disetujui!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Halo <strong>${reviewer}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Terima kasih telah memberikan review di platform kami.
              </p>
              
              <p style="margin: 10px 0 0; color: #666666; font-size: 14px;">
                Salam,<br>
                <strong>Tim CatalogApp</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                Email ini dikirim otomatis oleh sistem. Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}
