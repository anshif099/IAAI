import logo from "@/assets/iaai-logo.png";

const Footer = () => (
  <footer className="border-t border-border bg-foreground/[0.03] py-12">
    <div className="container mx-auto flex flex-col items-center gap-6 px-4 text-center md:flex-row md:justify-between md:text-left">
      <div className="flex flex-col items-center gap-3 md:items-start">
        <img src={logo} alt="IAAI logo" className="h-8 w-auto" />
        <p className="max-w-xs text-sm text-muted-foreground">
          AI-powered Google Review management for modern businesses.
        </p>
      </div>

      <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
        <a href="#" className="transition-colors hover:text-foreground">Privacy Policy</a>
        <a href="#" className="transition-colors hover:text-foreground">Terms &amp; Conditions</a>
        <a href="#" className="transition-colors hover:text-foreground">Contact</a>
      </nav>
    </div>

    <p className="mt-8 text-center text-xs text-muted-foreground">
      © 2026 IAAI. All rights reserved.
    </p>
  </footer>
);

export default Footer;
