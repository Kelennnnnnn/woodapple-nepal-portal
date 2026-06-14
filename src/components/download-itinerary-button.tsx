import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { Tour } from "@/lib/tours";
import { useCurrency } from "@/lib/currency";

export function DownloadItineraryButton({ tour }: { tour: Tour }) {
  const [loading, setLoading] = useState(false);
  const { format } = useCurrency();

  async function handleDownload() {
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 48;
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const maxW = pageW - margin * 2;
      let y = margin;

      const addPageIfNeeded = (needed = 60) => {
        if (y + needed > pageH - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const writeWrapped = (text: string, opts: { size?: number; bold?: boolean; lh?: number; color?: [number, number, number] } = {}) => {
        const { size = 11, bold = false, lh = 1.4, color = [40, 40, 40] } = opts;
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, maxW);
        for (const line of lines) {
          addPageIfNeeded(size * lh);
          doc.text(line, margin, y);
          y += size * lh;
        }
      };

      // Header band
      doc.setFillColor(170, 50, 45);
      doc.rect(0, 0, pageW, 90, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("WOODAPPLE TOURS AND TRAVEL", margin, 38);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Kathmandu, Nepal  ·  woodapple.travel", margin, 56);
      y = 130;

      writeWrapped(tour.title, { size: 22, bold: true, color: [25, 25, 25] });
      y += 4;
      writeWrapped(
        `${tour.duration_days} days  ·  ${tour.difficulty}  ·  ${tour.best_season}  ·  From ${format(tour.price_usd)} per person`,
        { size: 10, color: [110, 110, 110] },
      );
      y += 10;
      writeWrapped(tour.full_description || tour.short_description, { size: 11 });
      y += 14;

      if (tour.itinerary.length) {
        writeWrapped("Day-by-day itinerary", { size: 14, bold: true });
        y += 4;
        for (const d of tour.itinerary) {
          addPageIfNeeded(40);
          writeWrapped(`Day ${d.day}  —  ${d.title}`, { size: 12, bold: true, color: [170, 50, 45] });
          writeWrapped(d.description, { size: 10.5 });
          y += 6;
        }
      }

      const twoColumns = (leftTitle: string, left: string[], rightTitle: string, right: string[]) => {
        addPageIfNeeded(140);
        const colW = (maxW - 20) / 2;
        const startY = y;
        doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(25, 25, 25);
        doc.text(leftTitle, margin, y);
        doc.text(rightTitle, margin + colW + 20, y);
        y += 18;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(60, 60, 60);
        const writeCol = (items: string[], x: number) => {
          let cy = startY + 18;
          for (const it of items) {
            const lines = doc.splitTextToSize(`• ${it}`, colW);
            for (const ln of lines) { doc.text(ln, x, cy); cy += 14; }
          }
          return cy;
        };
        const ly = writeCol(left, margin);
        const ry = writeCol(right, margin + colW + 20);
        y = Math.max(ly, ry) + 8;
      };
      if (tour.included.length || tour.excluded.length) {
        y += 6;
        twoColumns("What's included", tour.included, "Not included", tour.excluded);
      }

      if (tour.faq.length) {
        y += 6;
        writeWrapped("Frequently asked questions", { size: 14, bold: true });
        y += 4;
        for (const f of tour.faq) {
          writeWrapped(f.q, { size: 11, bold: true });
          writeWrapped(f.a, { size: 10.5 });
          y += 6;
        }
      }

      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text(
          `Woodapple Tours and Travel  ·  Kathmandu, Nepal  ·  Page ${i} of ${pageCount}`,
          margin,
          pageH - 24,
        );
      }

      doc.save(`${tour.slug || "itinerary"}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Download itinerary PDF
    </button>
  );
}
