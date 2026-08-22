import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import storefronts from "@/assets/growthqr-storefronts.jpg";

const platforms = [
  { mark: "G", name: "Google", color: "text-[#4285f4]", bg: "bg-white" },
  { mark: "★", name: "Trustpilot", color: "text-white", bg: "bg-[#00b67a]" },
  { mark: "f", name: "Facebook", color: "text-white", bg: "bg-[#1877f2]" },
  { mark: "T", name: "Tripadvisor", color: "text-white", bg: "bg-[#00aa6c]" },
];

const Hero = () => (
  <section id="home" className="pt-0">
    <div className="landing-frame relative mx-auto min-h-[765px] max-w-[1010px] border-x border-dashed border-black/10 px-5 pb-0 pt-32 sm:px-10 sm:pt-36 lg:px-14">
      <div className="mx-auto flex max-w-[790px] flex-col items-center text-center">
        <a
          href="#how-it-works"
          className="group mb-6 inline-flex items-center gap-2 rounded-lg bg-[#17181c] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
        >
          <Sparkles size={13} className="text-[#ffd05b]" fill="currentColor" />
          <span>See it in <span className="font-normal tabular-nums">30</span> seconds</span>
          <span className="grid h-5 w-5 place-items-center rounded bg-white/10 transition group-hover:bg-white/20">
            <Play size={10} fill="currentColor" />
          </span>
        </a>

        <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0c63ff]">
          <span className="h-2 w-4 rounded-full bg-[#0c63ff]" />
          More reviews. Less awkward asking.
        </p>

        <h1 className="max-w-[840px] text-[2.55rem] font-black leading-[0.98] tracking-[-0.06em] text-[#19191d] sm:text-[4rem] lg:text-[4.65rem]">
          Turn happy customers into
          <span className="relative mx-auto mt-2 block w-fit px-2 sm:px-4">
            <span className="absolute inset-x-0 bottom-[3%] top-[10%] -z-0 -rotate-1 rounded-xl bg-[#f7cfe0]" />
            <span className="relative">five-star reviews.</span>
          </span>
        </h1>

        <p className="mt-6 max-w-[690px] text-base leading-7 text-[#575860] sm:text-[17px]">
          One smart QR code guides customers through a few friendly prompts, helps them write a natural review, and sends it straight to the platform you choose.
        </p>

        <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/login"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0c63ff] px-6 text-sm font-bold text-white shadow-[0_6px_14px_rgba(12,99,255,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0759e6]"
          >
            Start growing free <ArrowRight size={16} />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-black/10 bg-white px-6 text-sm font-bold text-[#2f3036] shadow-sm transition hover:-translate-y-0.5 hover:border-black/20"
          >
            See how it works
          </a>
        </div>
      </div>

      <div className="relative mx-auto mt-12 max-w-[940px] sm:mt-14">
        <span className="absolute bottom-5 left-2 hidden rotate-[-8deg] rounded-full border border-[#f0bb48]/40 bg-[#fff2bd] px-3 py-1 text-[10px] font-bold text-[#745813] shadow-sm sm:block">
          scan me ✦
        </span>
        <img
          src={storefronts}
          alt="A colorful row of local businesses using GrowthQR"
          className="h-auto w-full mix-blend-multiply"
        />
      </div>
    </div>

    <div className="landing-frame mx-auto max-w-[1010px] border border-dashed border-black/10 bg-white px-6 py-7 sm:px-10">
      <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_2.4fr]">
        <div>
          <p className="text-sm leading-6 text-[#5d5e65]">Works with the places your customers already trust.</p>
          <a href="#features" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#0c63ff] hover:underline">
            Explore every feature <ArrowRight size={12} />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {platforms.map((platform) => (
            <div key={platform.name} className="flex items-center gap-2 text-sm font-bold text-[#25262b]">
              <span className={`grid h-5 w-5 place-items-center rounded-md text-[11px] font-black shadow-sm ${platform.bg} ${platform.color}`}>
                {platform.mark}
              </span>
              {platform.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
