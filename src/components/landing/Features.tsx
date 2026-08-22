import { ArrowUpRight, BarChart3, FileDown, Languages, MapPinned, MessageCircleHeart, Sparkles } from "lucide-react";

const features = [
  {
    icon: Languages,
    title: "Reviews in their language",
    description: "Customers answer naturally. GrowthQR helps shape clear, authentic drafts across 30+ languages.",
    className: "bg-[#ffe7ef]",
    iconClass: "bg-[#ef7ca5] text-white",
  },
  {
    icon: MessageCircleHeart,
    title: "Keep concerns private",
    description: "Route unhappy experiences directly to your team so you can recover the relationship quickly.",
    className: "bg-[#e8f6e4]",
    iconClass: "bg-[#78b66e] text-white",
  },
  {
    icon: MapPinned,
    title: "Every location, one view",
    description: "Create branded codes for every branch and compare scans, reviews, ratings, and trends side by side.",
    className: "bg-[#e8efff]",
    iconClass: "bg-[#0c63ff] text-white",
  },
  {
    icon: FileDown,
    title: "Print-ready in seconds",
    description: "Download polished QR posters for receipts, table tents, counters, packaging, and A4 standees.",
    className: "bg-[#fff0cb]",
    iconClass: "bg-[#f1b840] text-[#3e2e09]",
  },
];

const Features = () => (
  <section id="features" className="scroll-mt-28">
    <div className="landing-frame mx-auto max-w-[1010px] border-x border-b border-dashed border-black/10 px-6 py-16 sm:px-10 lg:px-10 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div>
          <p className="section-kicker">Built to earn trust</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Everything behind one small QR.</h2>
        </div>
        <p className="max-w-lg text-[15px] leading-7 text-[#606168] lg:justify-self-end">
          Create better moments for your customers and a clearer feedback loop for your team—without adding more work to anyone’s day.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <article key={feature.title} className={`group min-h-[250px] rounded-[24px] border border-black/10 p-6 transition hover:-translate-y-1 hover:shadow-lg sm:p-7 ${feature.className}`}>
            <div className="flex items-start justify-between">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl shadow-sm ${feature.iconClass}`}>
                <feature.icon size={23} />
              </span>
              <ArrowUpRight className="text-black/35 transition group-hover:text-black" size={20} />
            </div>
            <h3 className="mt-10 text-2xl font-black tracking-[-0.04em] text-[#202126]">{feature.title}</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#55565d]">{feature.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid overflow-hidden rounded-[24px] border border-white/10 bg-[#18191e] text-white lg:grid-cols-[1fr_1.25fr]">
        <div className="p-7 sm:p-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#aabfff]">
            <Sparkles size={14} fill="currentColor" /> AI review intelligence
          </div>
          <h3 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Know what customers mean—not just what they rated.</h3>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
            Spot recurring themes, monitor sentiment, and turn every review into the next improvement your team should make.
          </p>
        </div>
        <div className="relative min-h-[300px] overflow-hidden bg-[#24262d] p-6 sm:p-8">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="relative rounded-2xl border border-white/10 bg-[#18191e] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Customer pulse</span>
              <span className="rounded-full bg-[#dff6e6] px-2.5 py-1 text-[10px] font-black text-[#28704b]">Healthy</span>
            </div>
            <div className="mt-6 flex items-end gap-2">
              {[48, 62, 55, 78, 68, 86, 94].map((height, index) => (
                <div key={height + index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-gradient-to-t from-[#0c63ff] to-[#8aaeff]" style={{ height }} />
                  <span className="text-[9px] text-white/35">{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.06] p-3"><BarChart3 size={15} className="text-[#8aaeff]" /><p className="mt-2 text-xl font-normal tabular-nums">+28%</p><p className="text-[10px] text-white/45">review growth</p></div>
              <div className="rounded-xl bg-white/[0.06] p-3"><p className="text-[11px] text-white/45">Top theme</p><p className="mt-3 text-sm font-black">Friendly service</p><p className="mt-1 text-[10px] text-[#80d8a2]">↑ 12% this month</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Features;
