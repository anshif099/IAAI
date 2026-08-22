import { ArrowRight, Linkedin, QrCode, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const FooterBrand = () => (
  <a href="#home" className="flex items-center gap-2.5" aria-label="GrowthQR home">
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#83a9ff] ring-1 ring-white/10"><QrCode size={21} /></span>
    <span className="text-lg font-black tracking-[-0.04em] text-white">Growth<span className="text-[#83a9ff]">QR</span></span>
  </a>
);

const Footer = () => (
  <footer>
    <div className="landing-frame mx-auto max-w-[1010px] border-x border-b border-dashed border-black/10 bg-white p-5 sm:p-8">
      <div className="relative overflow-hidden rounded-[28px] bg-[#0c63ff] px-6 py-14 text-center text-white sm:px-12 sm:py-16">
        <div className="absolute -left-10 -top-16 h-52 w-52 rounded-full border-[34px] border-white/[0.07]" />
        <div className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full border-[36px] border-white/[0.07]" />
        <span className="relative mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white/15"><Sparkles size={20} fill="currentColor" /></span>
        <h2 className="relative mx-auto mt-5 max-w-2xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">Your next great review is one scan away.</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-sm leading-6 text-white/75">Set up your business, download your QR, and start turning everyday customer moments into lasting trust.</p>
        <Link to="/login" className="relative mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-[#0c63ff] shadow-lg transition hover:-translate-y-0.5">
          Start growing free <ArrowRight size={15} />
        </Link>
      </div>
    </div>

    <div className="bg-[#17181c] text-white">
      <div className="mx-auto max-w-[1010px] px-6 py-12 sm:px-10">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.4fr_2fr]">
          <div>
            <FooterBrand />
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/50">A smarter way for local businesses to collect reviews, learn from feedback, and grow their reputation.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div><p className="text-xs font-black">Product</p><div className="mt-4 space-y-3 text-xs text-white/50"><a className="block hover:text-white" href="#how-it-works">How it works</a><a className="block hover:text-white" href="#features">Features</a><a className="block hover:text-white" href="#pricing">Pricing</a></div></div>
            <div><p className="text-xs font-black">Company</p><div className="mt-4 space-y-3 text-xs text-white/50"><a className="block hover:text-white" href="#home">About</a><a className="block hover:text-white" href="mailto:hello@growthqr.in">Contact</a><Link className="block hover:text-white" to="/login">Sign in</Link></div></div>
            <div><p className="text-xs font-black">Legal</p><div className="mt-4 space-y-3 text-xs text-white/50"><a className="block hover:text-white" href="#">Privacy</a><a className="block hover:text-white" href="#">Terms</a><a className="inline-flex items-center gap-1 hover:text-white" href="#">LinkedIn <Linkedin size={11} /></a></div></div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-[10px] text-white/35 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 GrowthQR. All rights reserved.</p><p>AI-powered review growth for local businesses.</p></div>
      </div>
    </div>
  </footer>
);

export default Footer;
