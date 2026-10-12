import jsPDF from "jspdf"
// @ts-expect-error - QRCode library doesn't have TypeScript definitions
import QRCodeLib from "qrcode"

export async function downloadQrPdf(url: string, name: string, logo: string) {
  const qr: string = await QRCodeLib.toDataURL(url, {
    errorCorrectionLevel: "H", margin: 1, width: 600,
    color: { dark: "#000000", light: "#FFFFFF" },
  })
  const pdf = new jsPDF("p", "mm", "a4")
  const w = pdf.internal.pageSize.getWidth()
  const h = pdf.internal.pageSize.getHeight()
  const size = 150, x = (w - size) / 2, y = (h - size) / 2 - 10, pad = 10

  pdf.setDrawColor(220, 220, 220)
  pdf.setLineWidth(0.5)
  pdf.roundedRect(x - pad, y - pad, size + pad * 2, size + pad * 2, 5, 5, "S")
  pdf.addImage(qr, "PNG", x, y, size, size)

  if (logo) {
    try {
      const ls = size * 0.22, bg = ls + 8
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(x + (size - bg) / 2, y + (size - bg) / 2, bg, bg, 3, 3, "F")
      pdf.addImage(logo, "PNG", x + (size - ls) / 2, y + (size - ls) / 2, ls, ls)
    } catch (e) { console.error("Logo error:", e) }
  }

  pdf.setTextColor(120, 120, 120)
  pdf.setFontSize(10)
  pdf.text("Powered by Botivate.in", w / 2, h - 15, { align: "center" })
  pdf.setTextColor(79, 70, 229)
  pdf.setFontSize(9)
  pdf.text("www.botivate.in", w / 2, h - 10, { align: "center" })
  pdf.save(`${name.replace(/\s+/g, "-")}-Contact-QR.pdf`)
}
