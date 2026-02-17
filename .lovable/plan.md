

# IAAI Landing Page Implementation Plan

## Design System
- **Primary gradient**: Deep Blue (#1e3a8a) → Purple (#7c3aed) → Orange (#f97316) matching the logo
- **Background**: White with alternating soft gray (#f8fafc) sections
- **Buttons**: Blue-to-Purple gradient for primary CTAs, outlined for secondary
- **Typography**: Dark gray/black, clean and modern
- **Border radius**: Rounded, modern SaaS aesthetic

## Sections to Build

### 1. Sticky Navbar
- IAAI logo (uploaded image) on the left
- Nav links: Home, Features, How It Works, Pricing — smooth scroll anchors
- "Login" gradient button on the right
- Mobile hamburger menu
- No Register/Sign Up buttons anywhere

### 2. Hero Section
- Headline: "Smarter Google Reviews, Powered by AI"
- Subtext about QR codes, AI analysis, multi-location tracking
- "Login" (gradient) + "View Features" (outlined) buttons
- Right side: coded dashboard mockup with QR code icon, star ratings, and a mini sentiment chart

### 3. Features Section (4 cards)
- Google Review QR Codes — QR icon
- AI Review Analysis — Brain/sparkle icon
- Multi-Location Management — MapPin icon
- Performance Tracking — TrendingUp icon
- 2×2 grid on desktop, stacked on mobile

### 4. How It Works (3 steps)
- Step 1: Login to IAAI
- Step 2: Generate Review QR Codes
- Step 3: AI Analyzes Reviews & Shows Insights
- Numbered circles with icons and connecting lines

### 5. AI Insights Section
- Recharts-powered mock visualizations: sentiment bar chart, review trend line, rating breakdown
- Text: "IAAI transforms customer opinions into actionable insights."

### 6. Who It's For
- 6 industry cards with icons: Restaurants, Retail Stores, Clinics, Salons, Hotels, Service Businesses

### 7. Footer
- Logo + short description
- Links: Privacy Policy, Terms & Conditions, Contact
- © 2026 IAAI. All rights reserved.

## Files to Create/Modify
- Copy uploaded logo to project assets
- Create landing page components (Navbar, Hero, Features, HowItWorks, AIInsights, WhoItsFor, Footer)
- Update `Index.tsx` to compose all sections
- Update `index.css` with gradient theme CSS variables
- Update `index.html` title to "IAAI — AI-Powered Google Reviews"

