import { amharicData } from "@/lib/amharic-data";

/** እሁድ ሐምሌ 19 ቀን 2018 ዓ.ም. (≈ July 26, 2026) */
const ETHIOPIAN_DATE = "እሁድ ሐምሌ 19 ቀን 2018 ዓ.ም.";
const ETHIOPIAN_TIME = "ከቀኑ 7:00 ሰዓት (1:00 PM)";

export function RingProgramCard() {
  return (
    <article className="ring-program-sheet relative mx-auto flex flex-col overflow-hidden bg-[#fff8f0] text-[#2d2d2d] shadow-lg print:shadow-none">
      {/* Image header */}
      <div className="relative h-[38%] min-h-[220px] shrink-0 overflow-hidden sm:min-h-[280px] md:min-h-[105mm]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/invite/front-ceremony-clean.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-[#fff8f0]" />
        <div className="absolute inset-x-4 top-[14%] flex flex-col items-center rounded-2xl bg-black/45 px-3 py-2.5 backdrop-blur-[1px] sm:inset-x-[12%] sm:top-[18%] sm:px-4 sm:py-3">
          <p className="font-amharic text-lg text-white sm:text-xl md:text-2xl">የቀለበት ስነ-ስርዓት</p>
          <p className="font-amharic mt-1 text-xs tracking-widest text-[#e8d48b] sm:text-sm">ግብዣ</p>
        </div>
      </div>

      {/* Invitation body — Amharic only */}
      <div className="relative z-10 flex flex-1 flex-col gap-4 px-4 pb-5 pt-1 sm:px-7 md:px-9">
        <section className="mt-4 text-center sm:mt-6 md:mt-8">
          <p className="font-amharic text-sm text-[#2d2d2d]/85">ከቤተሰቦቻችን ጋር በመሆን</p>
          <h2 className="font-amharic mt-2 text-2xl text-[#7a1f1f]">
            {amharicData.brideName} እና {amharicData.groomName}
          </h2>
          <p className="font-amharic mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-[#2d2d2d]/90">
            የቀለበት ስነ-ስርዓታችን ላይ እንድትገኙ በታላቅ አክብሮት እንጋብዛለን!
          </p>
        </section>

        <section className="space-y-2.5 rounded-sm border border-[#c9a227]/30 bg-[#fffdf8] px-4 py-3.5 text-center">
          <p className="font-amharic text-sm leading-relaxed text-[#2d2d2d]/90">
            <span className="font-medium text-[#7a1f1f]">ቀን፡</span> {ETHIOPIAN_DATE}
          </p>
          <p className="font-amharic text-sm leading-relaxed text-[#2d2d2d]/90">
            <span className="font-medium text-[#7a1f1f]">ሰዓት፡</span> {ETHIOPIAN_TIME}
          </p>
          <p className="font-amharic text-sm leading-relaxed text-[#2d2d2d]/90">
            <span className="font-medium text-[#7a1f1f]">ቦታ፡</span> {amharicData.venueName}፣ አዲሱ
            ገበያ፣ አዲስ አበባ፣ ኢትዮጵያ
          </p>
        </section>

        <section className="rounded-sm border border-[#c9a227]/30 bg-[#fffdf8] px-4 py-3 text-center">
          <p className="font-amharic text-sm leading-relaxed text-[#2d2d2d]/90">
            ኑ ከእኛ ጋር ምሳ ይጋበዙ እና ስነ-ስርዓታችንን በደስታ ያክብሩ።
          </p>
        </section>

        <section className="border-t border-[#c9a227]/25 pt-3 text-center">
          <h3 className="font-amharic text-xs text-[#c9a227]">ጋባዥ</h3>
          <p className="font-amharic mt-1.5 text-sm leading-relaxed text-[#2d2d2d]/90">
            እናት፡ ዳሳሽ ፍቃዱ
            <br />
            እህት፡ እናኑ ካሲ
            <br />
            እና ቤተሰቦቻቸው
          </p>
        </section>

        <footer className="mt-auto border-t border-[#c9a227]/30 pt-3 text-center">
          <p className="font-amharic text-sm text-[#7a1f1f]">መገኘታችሁ በዓላችንን የተሟላ ያደርገዋል</p>
          <p className="font-amharic mt-1 text-xs text-[#2d2d2d]/60">ስልክ፡ +251715664630</p>
        </footer>
      </div>
    </article>
  );
}
