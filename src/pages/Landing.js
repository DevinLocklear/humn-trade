import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const stats = [
  { value: '0', label: 'Trades Completed' },
  { value: '$0', label: 'In Protected Value' },
  { value: '0', label: 'Verified Traders' },
];

const features = [
  { icon: '◈', title: 'Trust Scores', desc: 'Every trader builds a verified reputation score based on completed trades, reviews, and account history.' },
  { icon: '◉', title: 'Trade Protection', desc: 'Pro members get financial protection on trades up to $500. One bad trade costs more than a year of Pro.' },
  { icon: '▲', title: 'Value Validation', desc: 'Declared trade values are cross-referenced against real eBay sold listings to prevent fraud.' },
  { icon: '▣', title: 'Cards & Sealed', desc: 'Trade raw singles, graded slabs, booster boxes, ETBs, tins — any physical Pokemon TCG product.' },
  { icon: '◎', title: 'Middleman Service', desc: 'High value trades can use a verified middleman who holds both items before releasing to each party.' },
  { icon: '◐', title: 'Discord Native', desc: 'Get trade alerts and notifications where you already are. The web app is home base, Discord is the feed.' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    protection: 'No protection',
    fee: '1.5% per trade',
    features: ['Create profile', 'List cards & sealed', 'Browse all trades', 'Basic trust score', 'Unlimited listings'],
  },
  {
    name: 'Basic',
    price: '$4.99',
    period: '/mo',
    protection: 'Up to $50',
    fee: '1% per trade',
    features: ['Everything in Free', '$50 trade protection', 'Verified badge', 'Priority matching', 'Discord alerts'],
    featured: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/mo',
    protection: 'Up to $200',
    fee: '0.75% per trade',
    features: ['Everything in Basic', '$200 trade protection', 'Dispute resolution', 'Middleman access', 'Lower fees'],
    featured: true,
  },
  {
    name: 'Elite',
    price: '$19.99',
    period: '/mo',
    protection: 'Up to $500',
    fee: '0.5% per trade',
    features: ['Everything in Pro', '$500 trade protection', 'Priority support', 'Insurance integration', 'Lowest fees'],
  },
];

const faqs = [
  { q: 'How does trade protection work?', a: 'If you follow our verified trade process and get scammed, we compensate you up to your plan\'s protection limit from our protection fund. Claims require evidence — photos, tracking info, and chat logs.' },
  { q: 'How are card values validated?', a: 'When you declare a trade value, we cross-reference it against recent eBay sold listings for that card and condition. Values more than 20% below market get flagged for review.' },
  { q: 'Who pays the transaction fee?', a: 'Both traders split the fee equally. On a $200 trade at 1%, each trader pays $1. Fees are held in escrow and released when both parties confirm the trade.' },
  { q: 'Can I trade sealed product?', a: 'Yes — booster boxes, ETBs, tins, bundles, and any sealed Pokemon TCG product. Sealed product is often easier to value since condition variables are simpler.' },
  { q: 'What if there\'s a dispute?', a: 'Pro and Elite members get access to our dispute resolution process. Both parties submit evidence and a decision is made within 5 business days. Free users handle disputes independently.' },
];

export default function Landing({ session }) {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN" className="nav-logo-img" />
            HUMN <span>TRADE</span>
          </div>
          <div className="nav-links">
            <a href="#how">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          {session ? (
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
          ) : (
            <button className="btn-primary" onClick={() => navigate('/auth')}>Start Trading</button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow-1" />
          <div className="hero-glow-2" />
        </div>
        <div className="hero-inner">
          <div className="hero-content">
            <div className="tag">Pokemon TCG Trading Platform</div>
            <h1 className="hero-title">
              TRADE POKEMON<br />
              CARDS WITH<br />
              <span className="hero-accent">REAL PROTECTION.</span>
            </h1>
            <p className="hero-sub">
              The first Pokemon TCG trading platform with verified trust scores,
              financial protection, and dispute resolution built in. No more Discord scams.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate(session ? '/listings' : '/auth')}>
                Browse Trades
              </button>
              <button className="btn-ghost" onClick={() => navigate(session ? '/dashboard' : '/auth')}>
                List Your Cards
              </button>
            </div>
          </div>
          <div className="hero-stats">
            {stats.map((s, i) => (
              <div key={i} className="hero-stat">
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section" id="how">
        <div className="section-inner">
          <div className="section-eyebrow">
            <span>How It Works</span>
            <div className="eyebrow-line" />
          </div>
          <h2 className="section-heading">SAFE TRADES IN 4 STEPS</h2>
          <div className="steps-grid">
            {[
              { num: '01', title: 'Create Your Profile', desc: 'Sign up and build your HUMN Trade profile. Your trust score starts at zero and grows with every completed trade.' },
              { num: '02', title: 'List What You Have & Want', desc: 'List cards and sealed product you want to trade. Browse listings from other verified traders.' },
              { num: '03', title: 'Match & Agree', desc: 'Get matched with compatible traders. Agree on trade terms, both parties pay a small fee upfront held in escrow.' },
              { num: '04', title: 'Complete & Review', desc: 'Ship your items with tracking. Both confirm receipt, fees release, trust scores update, and you leave a review.' },
            ].map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{step.num}</div>
                <div className="step-divider" />
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-inner">
          <div className="section-eyebrow">
            <span>Features</span>
            <div className="eyebrow-line" />
          </div>
          <h2 className="section-heading">BUILT FOR SERIOUS COLLECTORS</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section" id="pricing">
        <div className="section-inner">
          <div className="section-eyebrow">
            <span>Pricing</span>
            <div className="eyebrow-line" />
          </div>
          <h2 className="section-heading">PROTECTION THAT PAYS FOR ITSELF</h2>
          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <div key={i} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && <div className="plan-badge">Most Popular</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">{plan.price}<span>{plan.period}</span></div>
                <div className="plan-protection">
                  <span className="plan-protection-label">Protection:</span> {plan.protection}
                </div>
                <div className="plan-fee">
                  <span className="plan-fee-label">Fee:</span> {plan.fee}
                </div>
                <ul className="plan-features">
                  {plan.features.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
                <button
                  className={plan.featured ? 'btn-primary' : 'btn-ghost'}
                  onClick={() => navigate(session ? '/dashboard' : '/auth')}
                  style={{ width: '100%' }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="section-inner" style={{ maxWidth: 800 }}>
          <div className="section-eyebrow">
            <span>FAQ</span>
            <div className="eyebrow-line" />
          </div>
          <h2 className="section-heading">COMMON QUESTIONS</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && <div className="faq-answer">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">READY TO TRADE SAFELY?</h2>
          <p className="cta-sub">Join the first Pokemon TCG trading platform with real protection built in.</p>
          <button className="btn-primary" onClick={() => navigate(session ? '/dashboard' : '/auth')}>
            Start For Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN" className="nav-logo-img" />
            HUMN <span>TRADE</span>
          </div>
          <p className="footer-sub">Trusted Pokemon TCG trading</p>
          <div className="footer-links">
            <a href="https://x.com/UseHUMN" target="_blank" rel="noreferrer">x.com/UseHUMN</a>
            <a href="https://humnbot.com" target="_blank" rel="noreferrer">humnbot.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
