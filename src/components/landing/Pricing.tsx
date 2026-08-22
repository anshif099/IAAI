import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    monthly: 299,
    yearly: 249,
    eyebrow: "Build the review habit",
    description: "For one local business getting its first consistent stream of reviews.",
    features: ["1 business location", "Google review destination", "Branded QR posters", "Core scan & review analytics", "10 guided review flows / day"],
  },
  {
    name: "Growth",
    monthly: 499,
    yearly: 416,
    eyebrow: "Multilingual & insight-ready",
    description: "For growing teams that want more reviews and a clearer customer pulse.",
    features: ["Everything in Starter", "30+ review languages", "Private feedback routing", "AI sentiment & keyword trends", "100 guided review flows / day"],
    popular: true,
  },
  {
    name: "Scale",
    monthly: 749,
    yearly: 624,
    eyebrow: "For multi-location teams",
    description: "For brands that need one trusted review system across every storefront.",
    features: ["Everything in Growth", "64+ review destinations", "Unlimited review flows", "Location comparison reports", "Priority support"],
  },
];

const Pricing = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="scroll-mt-28">
      <div className="landing-frame mx-auto max-w-[1010px] border-x border-b border-dashed border-black/10 bg-[#f5f3ee] px-6 py-16 sm:px-10 lg:px-10 lg:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Simple pricing · no setup fees</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">Pick the pace that fits your business.</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#606168]">One flat price per location. Switch tiers or cancel whenever you need.</p>
          </div>

          <div className="inline-flex w-fit rounded-xl border border-black/10 bg-white p-1 shadow-sm" aria-label="Billing period">
            <button type="button" onClick={() => setYearly(false)} className={`rounded-lg px-4 py-2 text-xs font-bold transition ${!yearly ? "bg-[#17181c] text-white" : "text-[#6a6b72]"}`}>
              Monthly
            </button>
            <button type="button" onClick={() => setYearly(true)} className={`rounded-lg px-4 py-2 text-xs font-bold transition ${yearly ? "bg-[#17181c] text-white" : "text-[#6a6b72]"}`}>
              Yearly <span className="ml-1 font-normal tabular-nums text-[#3d9a65]">2 months free</span>
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative flex min-h-[510px] flex-col rounded-[24px] border p-6 sm:p-7 ${plan.popular ? "border-[#0c63ff] bg-white shadow-[0_14px_40px_rgba(12,99,255,0.12)]" : "border-black/10 bg-white/70"}`}>
              {plan.popular && (
                <span className="absolute -top-3 right-5 inline-flex items-center gap-1 rounded-full bg-[#0c63ff] px-3 py-1.5 text-[10px] font-black text-white shadow-md">
                  <Sparkles size={11} fill="currentColor" /> Most popular
                </span>
              )}
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[#777880]">{plan.name}</p>
              <h3 className="mt-3 text-lg font-black tracking-[-0.03em]">{plan.eyebrow}</h3>
              <div className="mt-6 flex items-end gap-1">
                <span className="mb-1 text-lg font-normal">₹</span>
                <span className="text-5xl font-normal tracking-[-0.035em] tabular-nums">{yearly ? plan.yearly : plan.monthly}</span>
                <span className="mb-1.5 text-xs font-normal text-[#73747b]">/ month</span>
              </div>
              <p className="mt-2 text-[10px] text-[#85868d]">per location · {yearly ? "billed annually" : "billed monthly"}</p>
              <p className="mt-6 min-h-[66px] text-sm leading-6 text-[#606168]">{plan.description}</p>

              <ul className="mt-6 space-y-3 border-t border-black/10 pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-xs font-semibold leading-5 text-[#46474e]">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#e6f5ea] text-[#337b51]"><Check size={10} strokeWidth={3} /></span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to="/login" className={`mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black transition hover:-translate-y-0.5 ${plan.popular ? "bg-[#0c63ff] text-white shadow-[0_5px_12px_rgba(12,99,255,.22)]" : "border border-black/10 bg-white text-[#25262b] hover:border-black/25"}`}>
                Choose {plan.name} <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-5 text-center text-[10px] leading-5 text-[#7f8087]">All prices are per location and exclusive of applicable taxes. Extra locations are available at a flat monthly rate.</p>
      </div>
    </section>
  );
};

export default Pricing;
