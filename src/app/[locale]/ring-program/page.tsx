"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { RingProgramCard } from "@/components/wedding/RingProgramCard";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 96 / 25.4;

export default function RingProgramPage() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const padding = 32;
      const sheetWidthPx = A4_WIDTH_MM * MM_TO_PX;
      const available = window.innerWidth - padding;
      setScale(Math.min(1, available / sheetWidthPx));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const scaledHeightPx = A4_HEIGHT_MM * MM_TO_PX * scale;

  return (
    <div className="ring-program-page font-amharic min-h-screen bg-[#525659] py-4 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex w-full max-w-[210mm] flex-wrap items-center justify-end gap-3 px-4 print:hidden">
        <Link
          href="/"
          className="rounded-md border border-[#7a1f1f]/30 bg-white px-4 py-2 text-sm text-[#7a1f1f] hover:bg-[#f8f4ec]"
        >
          ወደ ድረ-ገጽ ተመለስ
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-[#7a1f1f] px-5 py-2 text-sm text-white hover:bg-[#9a3535]"
        >
          አትም A4
        </button>
      </div>

      <div className="flex justify-center px-2 sm:px-4 print:block print:px-0">
        <div className="ring-program-viewport" style={{ height: scaledHeightPx }}>
          <div
            className="ring-program-scale"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
          >
            <RingProgramCard />
          </div>
        </div>
      </div>
    </div>
  );
}
