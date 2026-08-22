import { Check, Copy, MessageCircleMore, QrCode as QrIcon, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const steps = [
  {
    title: "Your customer scans",
    description: "Add the QR to receipts, table tents, packaging, or your front desk. No app needed.",
  },
  {
    title: "Three friendly prompts",
    description: "A quick guided flow captures the details that made their experience worth sharing.",
  },
  {
    title: "A polished review, ready to post",
    description: "GrowthQR shapes their answers into a natural draft they can edit, copy, and publish.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="scroll-mt-28">
    <div className="landing-frame mx-auto grid max-w-[1010px] border-x border-b border-dashed border-black/10 bg-white lg:grid-cols-[0.95fr_1.05fr]">
      <div className="px-6 py-16 sm:px-10 lg:px-10 lg:py-20">
        <p className="section-kicker">How it works</p>
        <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">From scan to posted in under a minute.</h2>
        <p className="mt-4 max-w-md text-[15px] leading-7 text-[#606168]">
          A thoughtful review flow that feels easy for your customer and gives your business useful feedback.
        </p>

        <div className="mt-10 border-t border-black/10">
          {steps.map((step, index) => (
            <div key={step.title} className="grid grid-cols-[32px_1fr] gap-3 border-b border-black/10 py-5">
              <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-normal tabular-nums ${index === 0 ? "bg-[#0c63ff] text-white" : "border border-black/15 bg-[#f8f8f5] text-[#4c4d53]"}`}>
                {index + 1}
              </span>
              <div>
                <h3 className="text-[15px] font-extrabold text-[#222329]">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#66676e]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative min-h-[620px] overflow-hidden border-t border-dashed border-black/10 bg-[radial-gradient(circle_at_30%_20%,#ffffff_0,#f5f6f8_42%,#edeff3_100%)] p-5 sm:p-10 lg:border-l lg:border-t-0">
        <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-[#dff6e6] blur-3xl" />
        <div className="absolute bottom-12 right-5 h-36 w-36 rounded-full bg-[#eadffe] blur-3xl" />

        <div className="relative mx-auto mt-8 w-[82%] max-w-[330px] rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_24px_60px_rgba(38,43,56,0.14)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-[#202127]">Scan &amp; review</p>
              <p className="mt-1 text-[10px] text-[#7a7b82]">GrowthQR · Table 08</p>
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf3ff] text-[#0c63ff]"><QrIcon size={16} /></span>
          </div>
          <div className="mt-5 grid min-h-[190px] place-items-center rounded-xl border border-dashed border-black/15 bg-[#fbfbfa]">
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <QRCodeSVG value="https://growthqr.example/review" size={112} fgColor="#222329" level="H" />
            </div>
          </div>
          <button type="button" className="mt-4 w-full rounded-xl bg-[#0c63ff] py-3 text-xs font-bold text-white">
            Open camera
          </button>
        </div>

        <div className="absolute right-3 top-[190px] w-[245px] rounded-2xl border border-black/10 bg-white p-4 shadow-[0_18px_38px_rgba(38,43,56,0.13)] sm:right-7">
          <div className="mb-3 flex items-center gap-2">
            <MessageCircleMore size={15} className="text-[#0c63ff]" />
            <span className="text-xs font-black">How was your visit?</span>
          </div>
          {["Loved it", "It was okay", "Could be better"].map((label, index) => (
            <div key={label} className={`mb-2 flex items-center justify-between rounded-lg border px-3 py-2 text-[11px] ${index === 0 ? "border-[#0c63ff] bg-[#f3f7ff] text-[#0c63ff]" : "border-black/10 text-[#66676e]"}`}>
              <span>{label}</span>
              {index === 0 && <Check size={13} />}
            </div>
          ))}
        </div>

        <div className="absolute bottom-7 left-3 w-[285px] rounded-2xl border border-black/10 bg-white p-4 shadow-[0_18px_38px_rgba(38,43,56,0.13)] sm:left-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black">Your review is ready</span>
            <Sparkles size={14} className="text-[#8b5cf6]" fill="currentColor" />
          </div>
          <p className="mt-2 rounded-lg bg-[#f7f7f4] p-3 text-[11px] leading-5 text-[#56575e]">
            “Such a welcoming team and an incredibly smooth experience. Everything felt thoughtful from start to finish.”
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#0c63ff]">Edit draft</span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#17181c] px-3 py-2 text-[10px] font-bold text-white">
              <Copy size={11} /> Copy &amp; post
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;
