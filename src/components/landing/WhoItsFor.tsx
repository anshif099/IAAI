import { Building2, HeartPulse, Hotel, Scissors, ShoppingBag, UtensilsCrossed } from "lucide-react";

const industries = [
  { icon: UtensilsCrossed, label: "Restaurants" },
  { icon: ShoppingBag, label: "Retail" },
  { icon: HeartPulse, label: "Clinics" },
  { icon: Scissors, label: "Salons" },
  { icon: Hotel, label: "Hotels" },
  { icon: Building2, label: "Local services" },
];

const quotes = [
  {
    quote: "We stopped reminding people three times. Customers scan once, and the reviews finally sound like them.",
    person: "Aarav Menon",
    role: "Restaurant owner · Bengaluru",
    tone: "bg-[#fff0cb]",
    avatar: "AM",
  },
  {
    quote: "The private feedback is just as valuable as the public reviews. My team now fixes problems the same day.",
    person: "Nisha Kapoor",
    role: "Salon director · Mumbai",
    tone: "bg-[#e8f6e4]",
    avatar: "NK",
  },
];

const WhoItsFor = () => (
  <section>
    <div className="landing-frame mx-auto max-w-[1010px] border-x border-b border-dashed border-black/10 bg-white px-6 py-16 sm:px-10 lg:px-10 lg:py-20">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">Loved by local teams</p>
          <h2 className="mt-4 max-w-xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">Small change. Big difference at the door.</h2>
        </div>
        <div className="flex flex-wrap gap-2 lg:max-w-[360px] lg:justify-end">
          {industries.map((industry) => (
            <span key={industry.label} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#faf9f6] px-3 py-2 text-[11px] font-bold text-[#56575e]">
              <industry.icon size={13} className="text-[#0c63ff]" /> {industry.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {quotes.map((item) => (
          <figure key={item.person} className={`rounded-[24px] border border-black/10 p-7 sm:p-8 ${item.tone}`}>
            <div className="flex gap-1 text-[#e1a329]">★★★★★</div>
            <blockquote className="mt-6 text-xl font-extrabold leading-8 tracking-[-0.025em] text-[#25262b]">“{item.quote}”</blockquote>
            <figcaption className="mt-8 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#17181c] text-xs font-black text-white">{item.avatar}</span>
              <div><p className="text-xs font-black">{item.person}</p><p className="mt-1 text-[10px] text-[#6f7077]">{item.role}</p></div>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-4 text-center text-[10px] text-[#8a8b91]">Illustrative customer stories showing typical GrowthQR use cases.</p>
    </div>
  </section>
);

export default WhoItsFor;
