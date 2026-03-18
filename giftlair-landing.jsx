/**
 * Giftlair — Landing Page
 * ─────────────────────────────────────────────────────────
 * Design direction: "Warm Luxury Minimal"
 *   → Deep charcoal + warm ivory + a single coral/peach accent
 *   → Serif display headlines (Cormorant Garamond) paired with
 *     clean sans body (Plus Jakarta Sans)
 *   → Generous whitespace, subtle grain texture via SVG filter,
 *     delicate border-only cards, restrained micro-animations
 *
 * Color palette:
 *   --ink:    #1a1612   (near-black, warm)
 *   --stone:  #3d3832   (body text)
 *   --mist:   #8c867e   (secondary text)
 *   --cream:  #faf8f4   (page background)
 *   --surface:#ffffff   (card surface)
 *   --border: #e8e3db   (dividers)
 *   --accent: #d4603a   (terracotta/coral CTA)
 *   --accent2:#f5e6de   (pale accent tint)
 *   --gold:   #c9a96e   (premium highlight)
 *
 * Font pairing (Google Fonts):
 *   Display → Cormorant Garamond 300/400/600 (elegant, editorial)
 *   Body    → Plus Jakarta Sans 400/500/600 (modern, readable)
 *
 * Alternative taglines:
 *   1. "Gift Smarter. Every Time."
 *   2. "The Gift They'll Actually Remember."
 *   3. "AI-Powered Gifting for Every Moment."
 */

import { useState, useEffect, useRef } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:     #1a1612;
    --stone:   #3d3832;
    --mist:    #8c867e;
    --cream:   #faf8f4;
    --surface: #ffffff;
    --border:  #e8e3db;
    --accent:  #d4603a;
    --accent2: #f5e6de;
    --gold:    #c9a96e;
    --r-sm: 8px;
    --r-md: 14px;
    --r-lg: 22px;
    --r-xl: 32px;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background: var(--cream);
    color: var(--stone);
    line-height: 1.7;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Typography ── */
  .display {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 300;
    line-height: 1.08;
    letter-spacing: -0.02em;
  }
  .display-strong { font-weight: 600; }
  .label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
  }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent); color: #fff;
    padding: 14px 32px; border-radius: 50px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px; font-weight: 600;
    border: none; cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(212,96,58,0.22);
    text-decoration: none;
  }
  .btn-primary:hover {
    background: #c05530;
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(212,96,58,0.3);
  }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: var(--stone);
    padding: 13px 28px; border-radius: 50px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px; font-weight: 500;
    border: 1.5px solid var(--border); cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
    text-decoration: none;
  }
  .btn-ghost:hover {
    border-color: var(--stone);
    background: rgba(26,22,18,0.04);
  }

  /* ── Layout ── */
  .container {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .section { padding: 96px 0; }
  .section-sm { padding: 64px 0; }

  /* ── Cards ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 32px;
    transition: border-color 0.2s, transform 0.22s, box-shadow 0.22s;
  }
  .card:hover {
    border-color: #d8d0c6;
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(26,22,18,0.07);
  }

  /* ── Divider ── */
  .divider { width: 100%; height: 1px; background: var(--border); }

  /* ── Fade-up animation ── */
  .fade-up {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .fade-up.visible { opacity: 1; transform: translateY(0); }

  /* ── Misc ── */
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  @media (max-width: 768px) {
    .section { padding: 64px 0; }
    .container { padding: 0 20px; }
  }
`;

// ─── ANIMATION HOOK ───────────────────────────────────────────────────────────
function useFadeUp(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
}

function FadeUp({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  useFadeUp(ref);
  return (
    <div ref={ref} className="fade-up" style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ onCTAClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      background: scrolled ? "rgba(250,248,244,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
    }}>
      <div className="container" style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>🎁</span>
          <span className="display" style={{ fontSize: 22, color: "var(--ink)", fontWeight: 600, letterSpacing: "-0.01em" }}>
            Giftlair
          </span>
        </a>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="nav-links">
          {["Features", "How it works", "FAQ"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              style={{ fontSize: 14, fontWeight: 500, color: "var(--mist)", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "var(--ink)"}
              onMouseLeave={e => e.target.style.color = "var(--mist)"}
            >{l}</a>
          ))}
        </div>

        {/* CTA */}
        <button className="btn-primary" onClick={onCTAClick}
          style={{ padding: "10px 24px", fontSize: 14 }}>
          Try for Free
        </button>
      </div>
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onCTAClick }) {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center",
      paddingTop: 120, paddingBottom: 80,
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle background circles */}
      <div style={{ position: "absolute", top: "8%", right: "-6%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,96,58,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", left: "-8%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="container">
        <div style={{ maxWidth: 780 }}>

          {/* Eyebrow badge */}
          <FadeUp delay={0}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent2)", border: "1px solid rgba(212,96,58,0.2)", borderRadius: 50, padding: "6px 16px", marginBottom: 36 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
              <span className="label" style={{ fontSize: 12 }}>AI-Powered Gift Finder · Free to Use</span>
            </div>
          </FadeUp>

          {/* Headline */}
          <FadeUp delay={80}>
            <h1 className="display" style={{ fontSize: "clamp(52px, 7.5vw, 96px)", color: "var(--ink)", marginBottom: 28, lineHeight: 1.03 }}>
              Stop Guessing.{" "}
              <span className="display-strong" style={{ color: "var(--accent)", fontStyle: "italic" }}>
                Start Gifting.
              </span>
            </h1>
          </FadeUp>

          {/* Sub-headline */}
          <FadeUp delay={150}>
            <p style={{ fontSize: "clamp(17px, 2vw, 20px)", color: "var(--mist)", lineHeight: 1.65, maxWidth: 580, marginBottom: 44 }}>
              Finding the right present shouldn't feel like a chore. Giftlair is your free AI shopping assistant — it surfaces thoughtful, unique, and trending gifts in seconds. Personalised for every person, every occasion.
            </p>
          </FadeUp>

          {/* CTAs */}
          <FadeUp delay={220}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 56 }}>
              <button className="btn-primary" onClick={onCTAClick} style={{ fontSize: 16, padding: "15px 36px" }}>
                Find the Perfect Gift
                <span style={{ fontSize: 18 }}>→</span>
              </button>
              <a href="#how-it-works" className="btn-ghost">
                See how it works
              </a>
            </div>
          </FadeUp>

          {/* Trust bar */}
          <FadeUp delay={300}>
            <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
              {[
                { icon: "⭐", text: "4.9 / 5 rating" },
                { icon: "🛡️", text: "100% Free, no sign-up needed" },
                { icon: "🇮🇳", text: "Prices in ₹ · Ships to India" },
              ].map(t => (
                <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 15 }}>{t.icon}</span>
                  <span style={{ fontSize: 13.5, color: "var(--mist)", fontWeight: 500 }}>{t.text}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        {/* Hero illustration / mockup card */}
        <FadeUp delay={200} style={{ marginTop: 72 }}>
          <HeroMockup />
        </FadeUp>
      </div>
    </section>
  );
}

// Mini gift card mockup strip for visual interest
function HeroMockup() {
  const cards = [
    { emoji: "🧣", name: "Pure Pashmina Shawl", price: "₹3,500–₹9,000", tag: "Luxury", color: "#f0eaf8" },
    { emoji: "📷", name: "Fujifilm Instax Mini", price: "₹4,500–₹8,500", tag: "Unique", color: "#e8f0fc" },
    { emoji: "🕯️", name: "Soy Candle Gift Set", price: "₹600–₹1,500", tag: "Budget", color: "#fdf0e8" },
    { emoji: "⌚", name: "Apple Watch Series 9", price: "₹35,000+", tag: "Luxury", color: "#e8f8f0" },
  ];
  return (
    <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          flex: "0 0 220px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-lg)",
          padding: "20px",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "default",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(26,22,18,0.09)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 14, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>
            {c.emoji}
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4, lineHeight: 1.3 }}>{c.name}</p>
          <p style={{ fontSize: 12.5, color: "var(--mist)", marginBottom: 10 }}>{c.price}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--accent2)", borderRadius: 50, padding: "3px 10px" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)" }}>{c.tag}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── LOGOS / SOCIAL PROOF ────────────────────────────────────────────────────
function SocialProof() {
  const platforms = [
    { name: "Amazon India", color: "#ff9900", icon: "a" },
    { name: "Flipkart",     color: "#2874f0", icon: "F" },
    { name: "Myntra",       color: "#ff3f6c", icon: "M" },
    { name: "Coursera",     color: "#0056d2", icon: "C" },
    { name: "Udemy",        color: "#a435f0", icon: "U" },
    { name: "Google Shopping", color: "#34a853", icon: "G" },
  ];
  return (
    <section className="section-sm" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
      <div className="container">
        <FadeUp>
          <p style={{ textAlign: "center", fontSize: 13, fontWeight: 500, color: "var(--mist)", marginBottom: 28, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Shop seamlessly across
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "clamp(16px, 4vw, 40px)", flexWrap: "wrap" }}>
            {platforms.map(p => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.7, transition: "opacity 0.2s", cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 14, color: "#fff" }}>{p.icon}</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--stone)" }}>{p.name}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── FEATURES ────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: "🌍",
      title: "Every Occasion, Covered",
      body: "Birthdays, weddings, anniversaries, baby showers, Diwali, Christmas, or a heartfelt 'Just Because' — Giftlair knows the occasion and makes it count.",
      color: "#e8f0fc",
    },
    {
      icon: "₹",
      title: "Smart Budget Filtering",
      body: "Set your range in Indian Rupees and instantly see the best value options — from thoughtful ₹500 picks to ₹50,000+ luxury statements.",
      color: "#fdf0e8",
    },
    {
      icon: "⚡",
      title: "Fast, Available & Deliverable",
      body: "Every recommendation is in-stock, popularly rated, and ships to India. No chasing unavailable products or dead links.",
      color: "#e8f8f0",
    },
    {
      icon: "🧠",
      title: "Curated by AI, Felt by Heart",
      body: "Our AI reads the relationship, the occasion, and their interests to surface gifts that feel personally chosen — not algorithmically generic.",
      color: "#f0eaf8",
    },
    {
      icon: "🔗",
      title: "Multi-Platform Shopping",
      body: "Every gift links to Amazon, Flipkart, Myntra, Coursera, or Google Shopping — so you always buy where you're most comfortable.",
      color: "#f5f0e8",
    },
    {
      icon: "🔒",
      title: "No Credit Card. Ever.",
      body: "Giftlair is completely free — no paywalls, no hidden fees, no subscription traps. Create a free account to save your favourite finds.",
      color: "#e8f8f8",
    },
  ];

  return (
    <section className="section" id="features">
      <div className="container">
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 16 }}>Why Giftlair</p>
            <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 56px)", color: "var(--ink)", marginBottom: 18 }}>
              Gifting, <span className="display-strong" style={{ fontStyle: "italic" }}>reimagined.</span>
            </h2>
            <p style={{ fontSize: 17, color: "var(--mist)", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
              Everything you need to nail the gift. Nothing you don't.
            </p>
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 60}>
              <div className="card" style={{ height: "100%" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginBottom: 10, lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ fontSize: 14.5, color: "var(--mist)", lineHeight: 1.7 }}>{f.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: "✍️",
      title: "Tell us about them",
      body: "Choose the occasion, your relationship, their interests, and your budget. Takes under 20 seconds.",
      color: "var(--accent2)",
      border: "rgba(212,96,58,0.2)",
    },
    {
      num: "02",
      icon: "🧠",
      title: "AI does the thinking",
      body: "Our recommendation engine analyses trends, reviews, and personalisation signals to curate a shortlist just for them.",
      color: "#e8f0fc",
      border: "rgba(40,116,240,0.18)",
    },
    {
      num: "03",
      icon: "🎁",
      title: "Shop in one click",
      body: "Every result links directly to Amazon, Flipkart, Myntra, and more — so you can buy instantly and impress effortlessly.",
      color: "#e8f8f0",
      border: "rgba(30,160,100,0.18)",
    },
  ];

  return (
    <section className="section" id="how-it-works" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="container">
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="label" style={{ marginBottom: 16 }}>The Process</p>
            <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 56px)", color: "var(--ink)", marginBottom: 18 }}>
              From blank page to{" "}
              <span className="display-strong" style={{ fontStyle: "italic", color: "var(--accent)" }}>perfect gift</span>
              <br />in three steps.
            </h2>
          </div>
        </FadeUp>

        {/* Steps */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, position: "relative" }}>
          {/* Connector line (desktop) */}
          <div style={{ position: "absolute", top: 42, left: "16.5%", right: "16.5%", height: 1, background: "linear-gradient(90deg, rgba(212,96,58,0.3), rgba(40,116,240,0.3), rgba(30,160,100,0.3))", display: "none" }} />

          {steps.map((s, i) => (
            <FadeUp key={s.num} delay={i * 100}>
              <div style={{
                background: "var(--cream)",
                border: `1px solid ${s.border}`,
                borderRadius: "var(--r-lg)",
                padding: "32px 28px",
                position: "relative",
                transition: "transform 0.22s, box-shadow 0.22s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 14px 44px rgba(26,22,18,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Step number */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {s.icon}
                  </div>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 300, color: "var(--border)", lineHeight: 1 }}>{s.num}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)", marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: "var(--mist)", lineHeight: 1.7 }}>{s.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Inline CTA */}
        <FadeUp delay={300}>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <a href="#app" className="btn-primary" style={{ fontSize: 16, padding: "15px 40px" }}>
              Try it now — it's free →
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────
function Testimonials() {
  const reviews = [
    { name: "Priya M.", role: "Mumbai", quote: "I found the perfect anniversary gift for my husband in literally 2 minutes. The suggestions were spot-on and all under ₹5,000.", avatar: "P", color: "#f0eaf8" },
    { name: "Rohan K.", role: "Bengaluru", quote: "Used it for my manager's farewell gift. AI suggested a leather journal — she loved it. Way better than the usual Archies gift card.", avatar: "R", color: "#e8f0fc" },
    { name: "Sneha T.", role: "Delhi", quote: "The budget filter is a game-changer. Set it to ₹1,000–₹2,500 and got actually thoughtful ideas, not just random stuff.", avatar: "S", color: "#fdf0e8" },
  ];

  return (
    <section className="section" style={{ background: "var(--cream)" }}>
      <div className="container">
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p className="label" style={{ marginBottom: 14 }}>What people are saying</p>
            <h2 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 50px)", color: "var(--ink)" }}>
              Gifts that <span className="display-strong" style={{ fontStyle: "italic" }}>actually landed.</span>
            </h2>
          </div>
        </FadeUp>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {reviews.map((r, i) => (
            <FadeUp key={r.name} delay={i * 80}>
              <div className="card" style={{ height: "100%" }}>
                {/* Stars */}
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[...Array(5)].map((_, si) => (
                    <span key={si} style={{ color: "#c9a96e", fontSize: 14 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 15, color: "var(--stone)", lineHeight: 1.7, marginBottom: 22, fontStyle: "italic" }}>"{r.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: r.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{r.avatar}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{r.name}</p>
                    <p style={{ fontSize: 12.5, color: "var(--mist)" }}>{r.role}</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MID-PAGE CTA ────────────────────────────────────────────────────────────
function MidCTA({ onCTAClick }) {
  return (
    <section style={{ padding: "80px 0", background: "var(--ink)" }}>
      <div className="container">
        <FadeUp>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
            <p className="label" style={{ color: "var(--gold)", marginBottom: 20 }}>Make gifting effortless</p>
            <h2 className="display" style={{ fontSize: "clamp(34px, 5vw, 60px)", color: "#faf8f4", marginBottom: 20 }}>
              The gift that says{" "}
              <span className="display-strong" style={{ fontStyle: "italic", color: "var(--gold)" }}>
                "I know you."
              </span>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(250,248,244,0.55)", lineHeight: 1.7, marginBottom: 40 }}>
              Stop spending hours scrolling through endless options. In under a minute, Giftlair finds something they'll actually love — and you'll look like you've been planning for weeks.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={onCTAClick} style={{ fontSize: 15.5, padding: "14px 36px" }}>
                Start Finding Gifts →
              </button>
              <a href="#faq" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 50, fontSize: 15, fontWeight: 500, color: "rgba(250,248,244,0.6)", border: "1.5px solid rgba(250,248,244,0.15)", transition: "color 0.2s, border-color 0.2s", cursor: "pointer", textDecoration: "none" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#faf8f4"; e.currentTarget.style.borderColor = "rgba(250,248,244,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(250,248,244,0.6)"; e.currentTarget.style.borderColor = "rgba(250,248,244,0.15)"; }}
              >
                Read the FAQ
              </a>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      q: "How does the AI Gift Finder actually work?",
      a: "You tell us three things: who the gift is for, the occasion, and your budget. Our AI matches those inputs against a curated database of trending, highly-rated products — then ranks them by relevance, availability, and value. The whole process takes under 30 seconds.",
    },
    {
      q: "What makes a good 'White Elephant' or Secret Santa gift?",
      a: "White Elephant gifts work best when they're fun, useful, and appeal broadly — think quality candle sets, quirky tech gadgets, artisan food boxes, or stylish notebooks. Set your budget to under ₹1,500 and filter for 'Budget-friendly' to find crowd-pleasing picks everyone will want to steal.",
    },
    {
      q: "Can I shop from multiple platforms?",
      a: "Absolutely. Every gift recommendation includes buy links to Amazon India, Flipkart, Myntra (for fashion/lifestyle), Coursera or Udemy (for courses), and Google Shopping as a universal fallback. You choose where to buy.",
    },
    {
      q: "Does Giftlair work for international occasions?",
      a: "Yes. Giftlair covers universal occasions — birthdays, weddings, anniversaries, graduations, baby showers, festivals, and more. While prices are shown in ₹ and links prioritise Indian availability, the gift ideas themselves are globally relevant.",
    },
    {
      q: "Is Giftlair really free? Are there any catches?",
      a: "100% free to use. No credit card, no subscription, no pop-up ads. You can optionally create a free account to save and revisit your favourite gift ideas — but even that's optional.",
    },
    {
      q: "How do I save my favourite gift ideas?",
      a: "Create a free Giftlair account (email or SSO with Google/GitHub/Facebook) and tap the heart icon on any gift card. Your saved list syncs to your account and is waiting for you whenever you log back in.",
    },
  ];

  return (
    <section className="section" id="faq" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
      <div className="container">
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p className="label" style={{ marginBottom: 14 }}>Got questions?</p>
            <h2 className="display" style={{ fontSize: "clamp(34px, 5vw, 54px)", color: "var(--ink)" }}>
              Frequently asked.
            </h2>
          </div>
        </FadeUp>

        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {faqs.map((f, i) => (
            <FadeUp key={i} delay={i * 50}>
              <div style={{
                border: "1px solid",
                borderColor: open === i ? "rgba(212,96,58,0.3)" : "var(--border)",
                borderRadius: "var(--r-md)",
                overflow: "hidden",
                background: open === i ? "rgba(245,230,222,0.25)" : "var(--surface)",
                transition: "border-color 0.2s, background 0.2s",
                marginBottom: 6,
              }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "20px 24px", background: "none", border: "none", cursor: "pointer",
                    textAlign: "left", gap: 16,
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", lineHeight: 1.4 }}>{f.q}</span>
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: open === i ? "var(--accent)" : "var(--accent2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: open === i ? "#fff" : "var(--accent)",
                    flexShrink: 0, transition: "background 0.2s, transform 0.25s",
                    transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}>+</span>
                </button>
                {open === i && (
                  <div style={{ padding: "0 24px 20px" }}>
                    <p style={{ fontSize: 15, color: "var(--mist)", lineHeight: 1.75 }}>{f.a}</p>
                  </div>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BOTTOM CTA ───────────────────────────────────────────────────────────────
function BottomCTA({ onCTAClick }) {
  return (
    <section style={{ padding: "96px 0 80px", background: "var(--cream)", borderTop: "1px solid var(--border)" }}>
      <div className="container">
        <FadeUp>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding: "clamp(40px, 6vw, 72px)",
            textAlign: "center",
            maxWidth: 760,
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Background glow */}
            <div style={{ position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)", width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,96,58,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

            <span style={{ fontSize: 40, display: "block", marginBottom: 20 }}>🎁</span>
            <p className="label" style={{ marginBottom: 18 }}>Ready to impress?</p>
            <h2 className="display" style={{ fontSize: "clamp(32px, 5vw, 56px)", color: "var(--ink)", marginBottom: 20, lineHeight: 1.08 }}>
              Your next great gift is{" "}
              <span className="display-strong" style={{ fontStyle: "italic", color: "var(--accent)" }}>one click away.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--mist)", lineHeight: 1.7, marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
              Join thousands of thoughtful gifters in India. No guessing, no stress — just the right gift, every time.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={onCTAClick} style={{ fontSize: 16, padding: "15px 40px" }}>
                Find the Perfect Gift — Free →
              </button>
            </div>
            <p style={{ fontSize: 13, color: "var(--mist)", marginTop: 20 }}>No account required · Ships to India · Prices in ₹</p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "var(--ink)", padding: "52px 0 32px" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>🎁</span>
              <span className="display" style={{ fontSize: 20, color: "#faf8f4", fontWeight: 600 }}>Giftlair</span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(250,248,244,0.4)", lineHeight: 1.65, maxWidth: 240 }}>
              AI-powered gift recommendations for every occasion and every budget.
            </p>
          </div>

          {/* Links */}
          {[
            { heading: "Product", links: ["Features", "How it works", "Pricing", "Changelog"] },
            { heading: "Support", links: ["FAQ", "Contact", "Privacy Policy", "Terms of Use"] },
          ].map(col => (
            <div key={col.heading}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,248,244,0.35)", marginBottom: 16 }}>{col.heading}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ fontSize: 14, color: "rgba(250,248,244,0.5)", transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = "#faf8f4"}
                    onMouseLeave={e => e.target.style.color = "rgba(250,248,244,0.5)"}
                  >{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(250,248,244,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "rgba(250,248,244,0.28)" }}>© 2025 Giftlair. All rights reserved.</p>
          <p style={{ fontSize: 13, color: "rgba(250,248,244,0.28)" }}>
            Made with ❤️ for thoughtful gifters in 🇮🇳 India
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── TOAST / APP LAUNCH SIMULATION ──────────────────────────────────────────
function AppLaunchToast({ onClose }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: "var(--ink)", color: "#faf8f4",
      padding: "16px 28px", borderRadius: 50,
      fontSize: 14.5, fontWeight: 500,
      display: "flex", alignItems: "center", gap: 14,
      zIndex: 2000, boxShadow: "0 8px 40px rgba(26,22,18,0.3)",
      animation: "slideUp 0.3s ease",
      whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 18 }}>🎁</span>
      The Gift Engine app is above this landing page — scroll up or click the app tab!
      <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(250,248,244,0.5)", cursor: "pointer", fontSize: 18, marginLeft: 4, lineHeight: 1 }}>✕</button>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function GiftlairLanding() {
  const [showToast, setShowToast] = useState(false);

  const handleCTA = () => {
    // In a real deployment this would route to the app
    // For now we show a friendly toast explaining the structure
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @media (max-width: 640px) {
          .nav-links { display: none; }
        }
      `}</style>

      <Nav onCTAClick={handleCTA} />
      <main id="app">
        <Hero onCTAClick={handleCTA} />
        <SocialProof />
        <Features />
        <HowItWorks />
        <Testimonials />
        <MidCTA onCTAClick={handleCTA} />
        <FAQ />
        <BottomCTA onCTAClick={handleCTA} />
      </main>
      <Footer />

      {showToast && <AppLaunchToast onClose={() => setShowToast(false)} />}
    </>
  );
}
