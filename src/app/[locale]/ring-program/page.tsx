"use client";

import { RingProgramCard } from "@/components/wedding/RingProgramCard";

export default function RingProgramPage() {
  return (
    <div className="ring-program-page font-amharic min-h-screen bg-[#e8e0d4] py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-end gap-3 px-4 print:hidden">
        <a
          href="/am"
          className="rounded-md border border-[#7a1f1f]/30 bg-white px-4 py-2 text-sm text-[#7a1f1f] hover:bg-[#f8f4ec]"
        >
          ወደ ድረ-ገጽ ተመለስ
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-[#7a1f1f] px-5 py-2 text-sm text-white hover:bg-[#9a3535]"
        >
          አትም A4
        </button>
      </div>

      <RingProgramCard />
    </div>
  );
}
