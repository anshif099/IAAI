import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const sentimentData = [
  { label: "Positive", value: 68 },
  { label: "Neutral", value: 22 },
  { label: "Negative", value: 10 },
];

const trendData = [
  { month: "Jan", reviews: 32 },
  { month: "Feb", reviews: 45 },
  { month: "Mar", reviews: 40 },
  { month: "Apr", reviews: 58 },
  { month: "May", reviews: 52 },
  { month: "Jun", reviews: 70 },
];

const ratingData = [
  { stars: "5★", count: 48 },
  { stars: "4★", count: 25 },
  { stars: "3★", count: 12 },
  { stars: "2★", count: 8 },
  { stars: "1★", count: 7 },
];

const AIInsights = () => (
  <section className="section-alt py-20">
    <div className="container mx-auto px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          AI-Powered <span className="gradient-text">Insights</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          IAAI transforms customer opinions into actionable insights so you can
          make data-driven decisions.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {/* Sentiment */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Sentiment Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sentimentData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="url(#sentGrad)" />
              <defs>
                <linearGradient id="sentGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(226 71% 33%)" />
                  <stop offset="100%" stopColor="hsl(263 70% 50%)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Review Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="reviews" stroke="hsl(263 70% 50%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rating breakdown */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ratingData}>
              <XAxis dataKey="stars" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="hsl(25 95% 53%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </section>
);

export default AIInsights;
