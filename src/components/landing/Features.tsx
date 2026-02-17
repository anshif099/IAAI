import { QrCode, Sparkles, MapPin, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: QrCode,
    title: "Google Review QR Codes",
    desc: "Generate QR codes that directly open Google review pages for your business.",
  },
  {
    icon: Sparkles,
    title: "AI Review Analysis",
    desc: "Automatically analyze reviews for sentiment, trends, and actionable insights.",
  },
  {
    icon: MapPin,
    title: "Multi-Location Management",
    desc: "Manage reviews from multiple business locations in one unified dashboard.",
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    desc: "Track ratings, review trends, and customer feedback growth over time.",
  },
];

const Features = () => (
  <section id="features" className="section-alt py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold sm:text-4xl">
        Everything You Need to <span className="gradient-text">Grow Reviews</span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        Powerful tools to collect, analyze, and act on customer feedback.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {features.map((f) => (
          <Card
            key={f.title}
            className="group border-border/60 bg-card transition-shadow hover:shadow-lg"
          >
            <CardContent className="flex flex-col items-start gap-4 p-6 text-left">
              <div className="gradient-primary flex h-12 w-12 items-center justify-center rounded-xl text-white">
                <f.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
