import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const features = [
  { icon: '🛡️', title: 'Trade Protection', desc: 'Pro members get financial protection up to $500 per trade. One bad Discord trade costs more than a year of Pro.', color: '#6c5ce7' },
  { icon: '⭐', title: 'Verified Trust Scores', desc: 'Every trader builds a public reputation. Scores grow with completed trades and positive reviews — scammers can\'t hide.', color: '#fd79a8' },
  { icon: '📊', title: 'Value Validation', desc: 'Declared values are cross-referenced against real eBay sold listings. Fraud gets flagged before a trade starts.', color: '#00cec9' },
  { icon: '📦', title: 'Cards & Sealed', desc: 'Trade raw singles, graded slabs, booster boxes, ETBs, tins — any physical Pokemon TCG product.', color: '#fdcb6e' },
  { icon: '🤝', title: 'Middleman Service', desc: 'High value trades use a verified middleman. Both items held and confirmed before reshipping.', color: '#6c5ce7' },
  { icon: '⚡', title: 'Discord Native', desc: 'Get trade alerts where you already live. The web app is home base, Discord is the notification layer.', color: '#fd79a8' },
];

const plans = [
  { name: 'Free', price: '$0', period: '/mo', protection: 'No protection', fee: '1.5% per trade', features: ['Create profile', 'List cards & sealed', 'Browse all trades', 'Basic trust score'] },
  { name: 'Basic', price: '$4.99', period: '/mo', protection: 'Up to $50', fee: '1% per trade', features: ['Everything in Free', '$50 trade protection', 'Verified badge', 'Priority matching', 'Discord alerts'] },
  { name: 'Pro', price: '$9.99', period: '/mo', protection: 'Up to $200', fee: '0.75% per trade', features: ['Everything in Basic', '$200 trade protection', 'Dispute resolution', 'Middleman access', 'Lower fees'], featured: true },
  { name: 'Elite', price: '$19.99', period: '/mo', protection: 'Up to $500', fee: '0.5% per trade', features: ['Everything in Pro', '$500 trade protection', 'Priority support', 'Insurance integration', 'Lowest fees'] },
];

const faqs = [
  { q: 'How does trade protection work?', a: 'If you follow our verified trade process and get scammed, we compensate you up to your plan\'s protection limit. Claims require photos, tracking info, and chat logs.' },
  { q: 'How are card values validated?', a: 'When you declare a trade value, we cross-reference it against recent eBay sold listings. Values more than 20% below market get flagged automatically.' },
  { q: 'Who pays the transaction fee?', a: 'Both traders split the fee equally. On a $200 trade at 1%, each trader pays $1. Fees are held in escrow until both parties confirm the trade.' },
  { q: 'Can I trade sealed product?', a: 'Yes — booster boxes, ETBs, tins, bundles, and any sealed Pokemon TCG product. Sealed product is often easier to value than raw singles.' },
  { q: 'What if there\'s a dispute?', a: 'Pro and Elite members get dispute resolution. Both parties submit evidence and a decision is made within 5 business days.' },
];

export default function Landing({ session }) {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [navDropOpen, setNavDropOpen] = useState(false);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => navigate('/')}>
            <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN" className="nav-logo-img" />
            HUMN <span>TRADE</span>
          </div>
          <div className="nav-links">
            <a href="#how">How It Works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="nav-actions">
            {session ? (
              <div style={{ position: 'relative' }}>
                <div className="nav-user" onClick={() => setNavDropOpen(o => !o)}>
                  {session.user?.user_metadata?.avatar_url
                    ? <img src={session.user.user_metadata.avatar_url} alt="avatar" className="nav-avatar" />
                    : <div className="nav-avatar-init">{session.user?.email?.[0]?.toUpperCase()}</div>
                  }
                  <span>{session.user?.user_metadata?.full_name?.split(' ')[0] || session.user?.email?.split('@')[0]}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>▾</span>
                </div>
                {navDropOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-email">{session.user?.email}</div>
                    {[['🏠 Dashboard', '/dashboard'], ['🔍 Browse Trades', '/listings'], ['📋 My Trades', '/trades']].map(([label, path]) => (
                      <div key={path} className="nav-dropdown-item" onClick={() => { navigate(path); setNavDropOpen(false); }}>{label}</div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', padding: '8px 0 0' }}>
                      <div className="nav-dropdown-item upgrade">⚡ Upgrade to Pro</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => navigate('/auth')} style={{ padding: '10px 20px', fontSize: 14, borderRadius: 12 }}>Sign In</button>
                <button className="btn-primary" onClick={() => navigate('/auth')} style={{ padding: '10px 20px', fontSize: 14, borderRadius: 12 }}>Get Started →</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-noise" />
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-dot" />
            Pokemon TCG · Peer-to-Peer Trading
          </div>
          <h1 className="hero-title">
            Trade Pokemon cards<br />
            without the <span className="hero-strike">scams.</span>
          </h1>
          <p className="hero-sub">
            The first trading platform built specifically for Pokemon collectors —
            with verified trust scores, real financial protection, and dispute resolution.
            Discord has the community. We have the safety layer.
          </p>
          <div className="hero-actions">
            <button className="hero-cta" onClick={() => navigate(session ? '/listings' : '/auth')}>
              Start Trading Free →
            </button>
            <button className="hero-secondary" onClick={() => navigate(session ? '/listings' : '/auth')}>
              Browse Listings
            </button>
          </div>
          <div className="hero-proof">
            <div className="hero-proof-item">
              <span className="hero-proof-val">0</span>
              <span className="hero-proof-label">Trades Protected</span>
            </div>
            <div className="hero-proof-divider" />
            <div className="hero-proof-item">
              <span className="hero-proof-val">0</span>
              <span className="hero-proof-label">Verified Traders</span>
            </div>
            <div className="hero-proof-divider" />
            <div className="hero-proof-item">
              <span className="hero-proof-val">$0</span>
              <span className="hero-proof-label">Protected Volume</span>
            </div>
          </div>
        </div>

        {/* Floating cards */}
        <div className="hero-cards">
          <div className="hero-card hc-1">
            <div className="hc-label">HAVE</div>
            <div className="hc-name">Charizard ex</div>
            <div className="hc-set">Prismatic Evolutions</div>
            <div className="hc-val">$287</div>
            <div className="hc-badge">✓ Verified Value</div>
          </div>
          <div className="hero-card hc-2">
            <div className="hc-trust-ring">
              <div className="hc-trust-val">94</div>
              <div className="hc-trust-label">Trust Score</div>
            </div>
            <div className="hc-trades">42 completed trades</div>
          </div>
          <div className="hero-card hc-3">
            <div className="hc-label want">WANT</div>
            <div className="hc-name">Umbreon VMAX Alt</div>
            <div className="hc-set">Evolving Skies</div>
            <div className="hc-val">$260</div>
            <div className="hc-badge protected">🛡️ Protected Trade</div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-track">
          {['🔥 Charizard ex — $287', '⭐ Umbreon VMAX Alt — $260', '💎 Moonbreon — $180', '🎯 Pikachu VMAX — $95', '✨ Rayquaza VMAX Alt — $220', '🌟 Gardevoir ex SAR — $140', '🔥 Charizard ex — $287', '⭐ Umbreon VMAX Alt — $260', '💎 Moonbreon — $180', '🎯 Pikachu VMAX — $95'].map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="how-section" id="how">
        <div className="section-inner">
          <div className="section-label">HOW IT WORKS</div>
          <h2 className="section-title">Safe trades in 4 steps</h2>
          <div className="steps-grid">
            {[
              { num: '01', title: 'Create Your Profile', desc: 'Sign up free. Your trust score starts at zero and grows with every completed trade and review.', icon: '👤' },
              { num: '02', title: 'List & Browse', desc: 'List what you have, list what you want. Browse thousands of listings from verified traders.', icon: '🔍' },
              { num: '03', title: 'Match & Agree', desc: 'Get matched with compatible traders. Both pay a small fee held in escrow until completion.', icon: '🤝' },
              { num: '04', title: 'Ship & Confirm', desc: 'Ship with tracking. Both confirm receipt, fees release, scores update, leave a review.', icon: '📦' },
            ].map(step => (
              <div key={step.num} className="step-card">
                <div className="step-top">
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-num">{step.num}</div>
                </div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-inner">
          <div className="section-label">FEATURES</div>
          <h2 className="section-title">Built for serious collectors</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ '--fc': f.color }}>
                <div className="feature-icon-wrap">{f.icon}</div>
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
          <div className="section-label">PRICING</div>
          <h2 className="section-title">Protection that pays for itself</h2>
          <p className="section-sub">One protected trade covers more than a year of Pro. Free to start, no credit card needed.</p>
          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <div key={i} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && <div className="plan-badge">⭐ Most Popular</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">{plan.price}<span>{plan.period}</span></div>
                <div className="plan-protection">🛡️ {plan.protection}</div>
                <div className="plan-fee">💸 Fee: {plan.fee}</div>
                <div className="plan-divider" />
                <ul className="plan-features">{plan.features.map((f, j) => <li key={j}>{f}</li>)}</ul>
                <button className={plan.featured ? 'btn-primary' : 'btn-ghost'} onClick={() => navigate(session ? '/dashboard' : '/auth')} style={{ width: '100%', marginTop: 'auto' }}>
                  {plan.name === 'Free' ? 'Start Free' : `Get ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="section-inner" style={{ maxWidth: 760 }}>
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Common questions</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-question">
                  {faq.q}
                  <div className="faq-icon">{openFaq === i ? '−' : '+'}</div>
                </div>
                {openFaq === i && <div className="faq-answer">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="final-cta-inner">
          <div className="final-cta-glow" />
          <div className="section-label" style={{ textAlign: 'center' }}>START TODAY</div>
          <h2 className="final-cta-title">Stop getting scammed.<br />Start trading smarter.</h2>
          <p className="final-cta-sub">Free to join. Your first trades are on us.</p>
          <button className="hero-cta" onClick={() => navigate(session ? '/listings' : '/auth')}>
            Create Your Profile →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-logo">
              <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }} />
              HUMN <span>TRADE</span>
            </div>
            <p className="footer-tagline">Trusted Pokemon TCG peer-to-peer trading.</p>
          </div>
          <div className="footer-links">
            <a href="https://x.com/UseHUMN" target="_blank" rel="noreferrer">X / Twitter</a>
            <a href="https://humnbot.com" target="_blank" rel="noreferrer">HUMN Bot</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
        <div className="footer-bottom">© 2025 HUMN Trade. All rights reserved.</div>
      </footer>
    </div>
  );
}
