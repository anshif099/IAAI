import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const plans = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    description: "Get started with essential review tools.",
    features: [
      "1 Business Location",
      "Google Review QR Code",
      "Basic Review Dashboard",
      "Monthly Performance Summary",
    ],
    cta: "Get Started",
    gradient: false,
  },
  {
    name: "Advanced",
    price: "$29",
    period: "/mo",
    description: "Unlock AI insights and multi-location management.",
    features: [
      "Unlimited Locations",
      "AI Review Analysis",
      "Sentiment & Trend Reports",
      "Priority Support",
      "Custom QR Code Branding",
      "Export Reports (CSV / PDF)",
    ],
    cta: "Login to Upgrade",
    gradient: true,
  },
];

const Pricing = () => (
  <section id="pricing" className="py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold sm:text-4xl">
        Simple, Transparent <span className="gradient-text">Pricing</span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        Start free and upgrade when you're ready for powerful AI features.
      </p>

      <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col border-border/60 text-left transition-shadow hover:shadow-lg ${
              plan.gradient ? "border-2 border-primary shadow-md" : ""
            }`}
          >
            {plan.gradient && (
              <div className="gradient-primary absolute -top-px left-1/2 h-1 w-2/3 -translate-x-1/2 rounded-b-full" />
            )}
            <CardHeader>
              <CardDescription className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {plan.name}
              </CardDescription>
              <CardTitle className="mt-2 flex items-baseline gap-1 text-4xl font-extrabold">
                {plan.price}
                {plan.period && (
                  <span className="text-base font-normal text-muted-foreground">{plan.period}</span>
                )}
              </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-6">
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <Button
                  className={`w-full ${plan.gradient ? "gradient-btn border-0 text-white hover:opacity-90" : ""}`}
                  variant={plan.gradient ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default Pricing;
