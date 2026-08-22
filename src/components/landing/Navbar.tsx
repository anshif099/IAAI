import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Menu, QrCode, X } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

const Brand = () => (
  <a href="#home" className="flex items-center gap-2.5" aria-label="GrowthQR home">
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2ff] text-[#0c63ff] ring-1 ring-[#0c63ff]/10">
      <QrCode size={21} strokeWidth={2.4} />
    </span>
    <span className="text-[17px] font-extrabold tracking-[-0.04em]">
      Growth<span className="text-[#0c63ff]">QR</span>
    </span>
  </a>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-5">
      <div className="mx-auto max-w-[936px] rounded-[18px] border border-black/10 bg-white/95 px-3 py-2 shadow-[0_6px_22px_rgba(21,24,34,0.08)] backdrop-blur-xl sm:px-4">
        <div className="flex items-center justify-between">
          <Brand />

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#62636b] transition-colors hover:text-[#0c63ff]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#2b2c32] transition-colors hover:bg-[#f3f3f0]"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0c63ff] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(12,99,255,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0759e6]"
            >
              Get started <ArrowUpRight size={15} />
            </Link>
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-[#24252b] md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <nav className="mt-2 border-t border-black/10 pb-2 pt-3 md:hidden" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block rounded-lg px-2 py-2.5 text-sm font-semibold text-[#4e4f57] hover:bg-[#f5f5f1]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link to="/login" className="rounded-xl border border-black/10 px-4 py-2.5 text-center text-sm font-semibold">
                Sign in
              </Link>
              <Link to="/login" className="rounded-xl bg-[#0c63ff] px-4 py-2.5 text-center text-sm font-semibold text-white">
                Get started
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
