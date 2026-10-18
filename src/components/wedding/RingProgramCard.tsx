import { amharicData } from "@/lib/amharic-data";

/** እሁድ ጥቅምት 22 ቀን 2019 ዓ.ም. (≈ November 1, 2026) */
const ETHIOPIAN_DATE = "እሁድ ጥቅምት 22 ቀን 2019 ዓ.ም.";
const ETHIOPIAN_TIME = "ከቀኑ 7:00 ሰዓት (1:00 PM)";

export function RingProgramCard() {
  return (
    <article className="ring-program-sheet relative mx-auto flex flex-col overflow-hidden bg-[#fff8f0] text-[#2d2d2d] shadow-2xl print:shadow-none">
      {/* Image header — ~40% of A4 height */}
      <div className="relative h-[40%] shrink-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/invite/front-ceremony-clean.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-[#fff8f0]" />
        <div className="absolute inset-x-[10%] top-[16%] flex flex-col items-center rounded-2xl bg-black/45 px-5 py-4 backdrop-blur-[1px]">
          <p className="font-amharic text-2xl text-white md:text-3xl">የቀለበት ስነ-ስርዓት</p>
          <p className="font-amharic mt-2 text-sm tracking-widest text-[#e8d48b] md:text-base">ግብዣ</p>
        </div>
      </div>

      {/* Invitation body — Amharic only, fills remaining A4 space */}
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-5 px-8 pb-8 pt-4 md:px-10 md:pb-10">
        <section className="mt-2 text-center">
          <p className="font-amharic text-base text-[#2d2d2d]/85 md:text-lg">ከቤተሰቦቻችን ጋር በመሆን</p>
          <h2 className="font-amharic mt-3 text-3xl text-[#7a1f1f] md:text-4xl">
            {amharicData.brideFullName} እና {amharicData.groomFullName}
          </h2>
          <p className="font-amharic mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#2d2d2d]/90 md:text-lg">
            የቀለበት ስነ-ስርዓታችን ላይ እንድትገኙ በታላቅ አክብሮት እንጋብዛለን!
          </p>
        </section>

        <section className="space-y-3 rounded-sm border border-[#c9a227]/30 bg-[#fffdf8] px-6 py-5 text-center">
          <p className="font-amharic text-base leading-relaxed text-[#2d2d2d]/90 md:text-lg">
            <span className="font-medium text-[#7a1f1f]">ቀን፡</span> {ETHIOPIAN_DATE}
          </p>
          <p className="font-amharic text-base leading-relaxed text-[#2d2d2d]/90 md:text-lg">
            <span className="font-medium text-[#7a1f1f]">ሰዓት፡</span> {ETHIOPIAN_TIME}
          </p>
          <p className="font-amharic text-base leading-relaxed text-[#2d2d2d]/90 md:text-lg">
            <span className="font-medium text-[#7a1f1f]">ቦታ፡</span> {amharicData.venueAddress}
          </p>
        </section>

        <section className="rounded-sm border border-[#c9a227]/30 bg-[#fffdf8] px-6 py-4 text-center">
          <p className="font-amharic text-base leading-relaxed text-[#2d2d2d]/90 md:text-lg">
            ኑ ከእኛ ጋር ምሳ ይጋበዙ እና ስነ-ስርዓታችንን በደስታ ያክብሩ።
          </p>
        </section>

        <section className="border-t border-[#c9a227]/25 pt-4 text-center">
          <h3 className="font-amharic text-sm text-[#c9a227] md:text-base">ጋባዥ</h3>
          <p className="font-amharic mt-2 text-base leading-relaxed text-[#2d2d2d]/90 md:text-lg">
            እናት፡ ዳሳሽ ፍቃዱ
            <br />
            እህት፡ እናኑ ካሲ
            <br />
            እና ቤተሰቦቻቸው
          </p>
        </section>

        <footer className="border-t border-[#c9a227]/30 pt-4 text-center">
          <p className="font-amharic text-base text-[#7a1f1f] md:text-lg">መገኘታችሁ በዓላችንን የተሟላ ያደርገዋል</p>
          <p className="font-amharic mt-2 text-sm text-[#2d2d2d]/60 md:text-base">
            የአስተባባሪ ስልክ፡ {amharicData.coordinatorPhone}
          </p>
        </footer>
      </div>
    </article>
  );
}
