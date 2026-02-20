import { LogIn, QrCode, BarChart3 } from "lucide-react";

const steps = [
  { icon: LogIn, title: "Login to GROWthQR", desc: "Sign in with your business account to access the dashboard." },
  { icon: QrCode, title: "Generate Review QR Codes", desc: "Create QR codes that link directly to your Google review page." },
  { icon: BarChart3, title: "AI Analyzes Reviews", desc: "Our AI processes reviews and surfaces sentiment, trends, and insights." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold sm:text-4xl">
        How It <span className="gradient-text">Works</span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        Three simple steps to smarter review management.
      </p>

      <div className="relative mt-14 grid gap-10 md:grid-cols-3">
        {/* Connecting line (desktop) */}
        <div className="absolute left-[16.7%] right-[16.7%] top-10 hidden h-0.5 bg-border md:block" />

        {steps.map((s, i) => (
          <div key={s.title} className="relative flex flex-col items-center gap-4">
            <div className="gradient-primary relative z-10 flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg">
              <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-card text-xs font-bold text-foreground shadow">
                {i + 1}
              </span>
              <s.icon size={28} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
            <p className="max-w-xs text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
