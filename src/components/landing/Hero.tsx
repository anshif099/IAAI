import { Button } from "@/components/ui/button";
import { QrCode, Star, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";

const mockSentiment = [
  { name: "Mon", value: 78 },
  { name: "Tue", value: 85 },
  { name: "Wed", value: 62 },
  { name: "Thu", value: 90 },
  { name: "Fri", value: 74 },
  { name: "Sat", value: 88 },
  { name: "Sun", value: 95 },
];

const Hero = () => (
  <section id="home" className="overflow-hidden py-20 lg:py-28">
    <div className="container mx-auto grid items-center gap-12 px-4 lg:grid-cols-2">
      {/* Left */}
      <div className="max-w-xl">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Smarter Google Reviews,{" "}
          <span className="gradient-text">Powered by AI</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Generate Google Review QR codes, analyze customer feedback using AI,
          and track review performance across all your business locations —
          effortlessly.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button className="gradient-btn border-0 px-8 text-white hover:opacity-90" size="lg">
            Login
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#features">View Features</a>
          </Button>
        </div>
      </div>

      {/* Right – dashboard mockup */}
      <div className="relative mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl lg:mx-0">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Dashboard</span>
          <span className="rounded-full bg-secondary px-3 py-0.5 text-xs font-medium text-muted-foreground">
            Live
          </span>
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-xl border border-border bg-secondary/50 p-3">
            <QrCode className="mb-1 text-primary" size={22} />
            <span className="text-lg font-bold text-foreground">128</span>
            <span className="text-[10px] text-muted-foreground">QR Scans</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border bg-secondary/50 p-3">
            <Star className="mb-1 text-accent" size={22} />
            <span className="text-lg font-bold text-foreground">4.7</span>
            <span className="text-[10px] text-muted-foreground">Avg Rating</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border bg-secondary/50 p-3">
            <TrendingUp className="mb-1" size={22} style={{ color: "hsl(25 95% 53%)" }} />
            <span className="text-lg font-bold text-foreground">+23%</span>
            <span className="text-[10px] text-muted-foreground">Growth</span>
          </div>
        </div>

        {/* Mini chart */}
        <div className="rounded-xl border border-border bg-secondary/30 p-3">
          <span className="mb-2 block text-xs font-medium text-muted-foreground">
            Weekly Sentiment
          </span>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={mockSentiment}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="url(#barGrad)" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(226 71% 33%)" />
                  <stop offset="100%" stopColor="hsl(263 70% 50%)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
