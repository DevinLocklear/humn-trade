import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const features = [
  { icon: '🛡️', title: 'Trade Protection', desc: 'Financial protection up to $500 per trade. One Discord scam costs more than years of Pro.' },
  { icon: '⭐', title: 'Trust Scores', desc: 'Every trader builds a public reputation. Grows with completed trades — bad actors can\'t hide.' },
  { icon: '📊', title: 'Value Validation', desc: 'Values cross-referenced against real eBay sold listings. Fraud gets flagged before trades start.' },
  { icon: '📦', title: 'Cards & Sealed', desc: 'Raw singles, graded slabs, booster boxes, ETBs, tins — any physical Pokemon TCG product.' },
  { icon: '🤝', title: 'Middleman Service', desc: 'High value trades use a verified middleman. Both items confirmed before reshipping.' },
  { icon: '⚡', title: 'Discord Native', desc: 'Get trade alerts where you already live. Web app is home base, Discord is the feed.' },
];

const plans = [
  { name: 'Free', price: '$0', period: '/mo', protection: 'No protection', fee: '1.5% per trade', features: ['Create profile', 'List cards & sealed', 'Browse all trades', 'Basic trust score'] },
  { name: 'Basic', price: '$4.99', period: '/mo', protection: 'Up to $50', fee: '1% per trade', features: ['Everything in Free', '$50 trade protection', 'Verified badge', 'Priority matching', 'Discord alerts'] },
  { name: 'Pro', price: '$9.99', period: '/mo', protection: 'Up to $200', fee: '0.75% per trade', features: ['Everything in Basic', '$200 trade protection', 'Dispute resolution', 'Middleman access', 'Lower fees'], featured: true },
  { name: 'Elite', price: '$19.99', period: '/mo', protection: 'Up to $500', fee: '0.5% per trade', features: ['Everything in Pro', '$500 trade protection', 'Priority support', 'Insurance integration', 'Lowest fees'] },
];

const faqs = [
  { q: 'How does trade protection work?', a: 'If you follow our verified trade process and get scammed, we compensate you up to your plan\'s limit. Claims require photos, tracking info, and chat logs.' },
  { q: 'How are card values validated?', a: 'Declared values are cross-referenced against recent eBay sold listings. Values more than 20% below market get flagged automatically.' },
  { q: 'Who pays the transaction fee?', a: 'Both traders split it equally. On a $200 trade at 1%, each pays $1. Fees are held in escrow until both confirm the trade is complete.' },
  { q: 'Can I trade sealed product?', a: 'Yes — booster boxes, ETBs, tins, bundles, and any sealed Pokemon TCG product. Sealed is often easier to value than raw singles.' },
  { q: 'What happens in a dispute?', a: 'Pro and Elite members get dispute resolution. Both submit evidence and a decision is made within 5 business days.' },
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
            HUMN <span>Trade</span>
          </div>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-actions">
            {session ? (
              <div style={{ position: 'relative' }}>
                <div className="nav-user" onClick={() => setNavDropOpen(o => !o)}>
                  {session.user?.user_metadata?.avatar_url
                    ? <img src={session.user.user_metadata.avatar_url} alt="avatar" className="nav-avatar" />
                    : <div className="nav-avatar-init">{session.user?.email?.[0]?.toUpperCase()}</div>
                  }
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{session.user?.user_metadata?.full_name?.split(' ')[0] || session.user?.email?.split('@')[0]}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>▾</span>
                </div>
                {navDropOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-email">{session.user?.email}</div>
                    {[['Dashboard', '/dashboard'], ['Browse Trades', '/listings'], ['My Trades', '/trades']].map(([label, path]) => (
                      <div key={path} className="nav-dropdown-item" onClick={() => { navigate(path); setNavDropOpen(false); }}>{label}</div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="nav-dropdown-item upgrade">Upgrade to Pro</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => navigate('/auth')} style={{ padding: '8px 16px' }}>Sign in</button>
                <button className="hero-cta" onClick={() => navigate('/auth')} style={{ padding: '8px 18px', fontSize: 14 }}>Get started free</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero — centered */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="hero-dot" />
          Pokemon TCG · Peer-to-Peer Trading
        </div>
        <h1 className="hero-title">
          The safest way to trade<br />
          Pokemon cards <span>peer to peer.</span>
        </h1>
        <p className="hero-sub">
          Verified trust scores, financial protection up to $500, and real dispute resolution.
          Discord has the community. We have the infrastructure.
        </p>
        <div className="hero-actions">
          <button className="hero-cta" onClick={() => navigate(session ? '/listings' : '/auth')}>
            Start trading free →
          </button>
          <button className="hero-secondary" onClick={() => navigate(session ? '/listings' : '/auth')}>
            Browse listings
          </button>
        </div>
        <div className="hero-proof">
          {[['0', 'Trades protected'], ['$0', 'Protected volume'], ['0', 'Verified traders']].map(([val, label], i) => (
            <React.Fragment key={label}>
              {i > 0 && <div className="hero-proof-divider" />}
              <div className="hero-proof-item">
                <span className="hero-proof-val">{val}</span>
                <span className="hero-proof-label">{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* App screenshot */}
        <div className="hero-screenshot">
          <div className="screenshot-bar">
            <div className="screenshot-dots">
              <div className="screenshot-dot" style={{ background: '#ff5f57' }} />
              <div className="screenshot-dot" style={{ background: '#febc2e' }} />
              <div className="screenshot-dot" style={{ background: '#28c840' }} />
            </div>
            <div className="screenshot-url">humn-trade.vercel.app/listings</div>
          </div>
          <div className="screenshot-body">
            <div className="screenshot-sidebar">
              <div style={{ padding: '0 4px 12px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src="https://i.imgur.com/ywgtHOK.png" alt="" style={{ width: 20, height: 20, borderRadius: 5 }} />
                  HUMN Trade
                </div>
              </div>
              {[['🏠', 'Dashboard', false], ['🔍', 'Browse Trades', true], ['📋', 'My Trades', false], ['👤', 'Profile', false]].map(([icon, label, active]) => (
                <div key={label} className={`ss-nav-item ${active ? 'active' : ''}`}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
            <div className="screenshot-main">
              <div className="ss-header">
                <div className="ss-title">Browse Trades</div>
                <button className="ss-btn">+ Create Listing</button>
              </div>
              {[
                { icon: '🔥', name: 'Charizard ex', meta: 'Prismatic Evolutions · Raw', val: '$287', type: 'have' },
                { icon: '⭐', name: 'Umbreon VMAX Alt Art', meta: 'Evolving Skies · Raw', val: '$260', type: 'want' },
                { icon: '📦', name: 'Prismatic Evolutions ETB', meta: 'Sealed · Qty 2', val: '$149', type: 'have' },
              ].map((item, i) => (
                <div key={i} className="ss-card">
                  <div className="ss-card-icon">{item.icon}</div>
                  <div className="ss-card-info">
                    <div className="ss-card-name">{item.name}</div>
                    <div className="ss-card-meta">{item.meta}</div>
                  </div>
                  <div className="ss-card-right">
                    <div className="ss-card-val">{item.val}</div>
                    <div className={`ss-tag ${item.type === 'have' ? 'ss-tag-have' : 'ss-tag-want'}`}>{item.type.toUpperCase()}</div>
                  </div>
                </div>
              ))}
              <div className="ss-trust-bar">
                <div className="ss-trust-left">
                  <div className="ss-trust-label">Your trust score</div>
                  <div className="ss-trust-val">94</div>
                </div>
                <div className="ss-badge">✓ 42 trades verified</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stats-bar-inner">
          {[['0', 'Trades completed'], ['$0', 'Protected volume'], ['0', 'Active traders'], ['0%', 'Fraud rate']].map(([val, label]) => (
            <div key={label} className="stat-bar-item">
              <div className="stat-bar-value">{val}</div>
              <div className="stat-bar-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="how-section" id="how">
        <div className="section-inner">
          <span className="section-eyebrow">How it works</span>
          <h2 className="section-title">Safe trades in four steps</h2>
          <p className="section-sub">A structured process that protects both parties from the moment you match to the moment cards arrive.</p>
          <div className="steps-grid">
            {[
              { num: '01', icon: '👤', title: 'Create your profile', desc: 'Sign up free. Your trust score starts at zero and builds with every completed trade and review.' },
              { num: '02', icon: '🔍', title: 'List and browse', desc: 'List what you have, list what you want. Browse listings from verified traders in real time.' },
              { num: '03', icon: '🤝', title: 'Match and agree', desc: 'Get matched with compatible traders. Both pay a small fee held in escrow until completion.' },
              { num: '04', icon: '📦', title: 'Ship and confirm', desc: 'Ship with tracking. Both confirm receipt. Fees release, scores update, leave a review.' },
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
          <span className="section-eyebrow">Features</span>
          <h2 className="section-title">Built for serious collectors</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
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
          <span className="section-eyebrow">Pricing</span>
          <h2 className="section-title">Protection that pays for itself</h2>
          <p className="section-sub">One protected trade covers more than a year of Pro. Free to start, no credit card required.</p>
          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <div key={i} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && <div className="plan-badge">Most popular</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">{plan.price}<span>{plan.period}</span></div>
                <div className="plan-protection">{plan.protection}</div>
                <div className="plan-fee">Fee: {plan.fee}</div>
                <div className="plan-divider" />
                <ul className="plan-features">{plan.features.map((f, j) => <li key={j}>{f}</li>)}</ul>
                <button className={plan.featured ? 'btn-primary' : 'btn-ghost'} onClick={() => navigate(session ? '/dashboard' : '/auth')} style={{ width: '100%' }}>
                  {plan.name === 'Free' ? 'Start free' : `Get ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="section-inner" style={{ maxWidth: 720 }}>
          <span className="section-eyebrow">FAQ</span>
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

      {/* CTA */}
      <section className="final-cta">
        <div className="final-cta-inner">
          <div className="final-cta-text">
            <h2 className="final-cta-title">Ready to trade safely?</h2>
            <p className="final-cta-sub">Join the first Pokemon TCG trading platform with real protection. Free to start.</p>
          </div>
          <div className="final-cta-actions">
            <button className="cta-btn-white" onClick={() => navigate(session ? '/listings' : '/auth')}>Create your profile →</button>
            <button className="cta-btn-outline" onClick={() => navigate(session ? '/listings' : '/auth')}>Browse listings</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-logo">
              <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN" style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 5 }} />
              HUMN <span>Trade</span>
            </div>
            <p className="footer-tagline">Trusted Pokemon TCG peer-to-peer trading.</p>
          </div>
          <div className="footer-links">
            <a href="https://x.com/UseHUMN" target="_blank" rel="noreferrer">Twitter</a>
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
