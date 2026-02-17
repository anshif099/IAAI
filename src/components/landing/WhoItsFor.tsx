import { UtensilsCrossed, ShoppingBag, Stethoscope, Scissors, Hotel, Wrench } from "lucide-react";

const industries = [
  { icon: UtensilsCrossed, label: "Restaurants" },
  { icon: ShoppingBag, label: "Retail Stores" },
  { icon: Stethoscope, label: "Clinics" },
  { icon: Scissors, label: "Salons" },
  { icon: Hotel, label: "Hotels" },
  { icon: Wrench, label: "Service Businesses" },
];

const WhoItsFor = () => (
  <section className="py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold sm:text-4xl">
        Built for <span className="gradient-text">Every Business</span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        Whether you're a restaurant owner or run a hotel chain, IAAI helps you
        manage and grow your online reputation.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {industries.map((ind) => (
          <div
            key={ind.label}
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="gradient-primary flex h-14 w-14 items-center justify-center rounded-xl text-white">
              <ind.icon size={26} />
            </div>
            <span className="text-sm font-medium text-foreground">{ind.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhoItsFor;
