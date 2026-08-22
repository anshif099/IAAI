import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import AIInsights from "@/components/landing/AIInsights";
import WhoItsFor from "@/components/landing/WhoItsFor";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="landing-page min-h-screen overflow-hidden bg-[#fbfaf7] text-[#17171b]">
    <Navbar />
    <main>
      <Hero />
      <HowItWorks />
      <Features />
      <AIInsights />
      <WhoItsFor />
      <Pricing />
    </main>
    <Footer />
  </div>
);

export default Index;
