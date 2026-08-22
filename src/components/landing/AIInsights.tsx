import { ArrowDownRight, ArrowUpRight, MessageSquareText, Star, TrendingUp } from "lucide-react";

const metrics = [
  { value: "4.8", label: "average rating", detail: "+0.3 this quarter", icon: Star, tone: "text-[#e6a71c]" },
  { value: "1,284", label: "reviews collected", detail: "+28% this month", icon: MessageSquareText, tone: "text-[#0c63ff]" },
  { value: "92%", label: "positive sentiment", detail: "+6% vs last month", icon: TrendingUp, tone: "text-[#3d9a65]" },
];

const AIInsights = () => (
  <section>
    <div className="landing-frame mx-auto max-w-[1010px] border-x border-b border-dashed border-black/10 bg-[#f5f3ee] px-6 py-16 sm:px-10 lg:px-10 lg:py-20">
      <div className="text-center">
        <p className="section-kicker">Clear, useful analytics</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">See your reputation getting stronger.</h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[#606168]">
          Every scan, draft, review, and customer concern becomes a signal your team can use.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_18px_50px_rgba(35,38,45,0.07)]">
        <div className="flex flex-col gap-3 border-b border-black/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-sm font-black">All locations</p>
            <p className="mt-1 text-[11px] text-[#777880]">Performance overview · Last 30 days</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-lg bg-[#f2f3f5] px-3 py-2 text-[10px] font-normal tabular-nums text-[#6a6b73]">Apr 18 – May 17</span>
            <span className="rounded-lg bg-[#17181c] px-3 py-2 text-[10px] font-bold text-white">Export report</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3">
          {metrics.map((metric, index) => (
            <div key={metric.label} className={`p-6 sm:p-7 ${index < metrics.length - 1 ? "border-b border-black/10 md:border-b-0 md:border-r" : ""}`}>
              <div className="flex items-start justify-between">
                <metric.icon size={18} className={metric.tone} />
                <ArrowUpRight size={15} className="text-black/25" />
              </div>
              <p className="mt-8 text-4xl font-normal tracking-[-0.02em] tabular-nums">{metric.value}</p>
              <p className="mt-1 text-xs font-bold text-[#595a61]">{metric.label}</p>
              <p className="mt-3 text-[10px] font-normal tabular-nums text-[#3d9a65]">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid border-t border-black/10 lg:grid-cols-[1.5fr_1fr]">
          <div className="border-b border-black/10 p-6 sm:p-7 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black">Review momentum</p>
              <span className="text-[10px] font-bold text-[#73747b]">Weekly</span>
            </div>
            <div className="mt-8 flex h-44 items-end gap-3">
              {[34, 44, 39, 62, 58, 77, 69, 88, 96, 91, 118, 128].map((height, index) => (
                <div key={height + index} className="group relative flex h-full flex-1 items-end">
                  <div className="w-full rounded-t-[5px] bg-[#dce7ff] transition group-hover:bg-[#0c63ff]" style={{ height }} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[9px] font-normal tabular-nums text-[#9a9ba1]"><span>WEEK 1</span><span>WEEK 2</span><span>WEEK 3</span><span>WEEK 4</span></div>
          </div>

          <div className="p-6 sm:p-7">
            <p className="text-xs font-black">What customers mention</p>
            <div className="mt-6 space-y-5">
              {[
                { label: "Service", value: 86, change: "+14%", positive: true },
                { label: "Quality", value: 74, change: "+8%", positive: true },
                { label: "Wait time", value: 38, change: "-5%", positive: false },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="font-semibold">{item.label}</span>
                    <span className={`inline-flex items-center font-normal tabular-nums ${item.positive ? "text-[#3d9a65]" : "text-[#de6c55]"}`}>
                      {item.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {item.change}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#eeefef]"><div className="h-full rounded-full bg-[#0c63ff]" style={{ width: `${item.value}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AIInsights;
