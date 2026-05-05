import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const features = [
  { icon: '🛡️', title: 'Trade Protection', desc: 'Pro members get financial protection up to $500 per trade. One bad Discord trade costs more than a year of Pro.' },
  { icon: '⭐', title: 'Trust Scores', desc: 'Every trader builds a verified reputation. Trust scores grow with completed trades and positive reviews.' },
  { icon: '✅', title: 'Value Validation', desc: 'Declared values are cross-referenced against real eBay sold listings. Fraud gets flagged automatically.' },
  { icon: '📦', title: 'Cards & Sealed', desc: 'Trade raw singles, graded slabs, booster boxes, ETBs, tins — any physical Pokemon TCG product.' },
  { icon: '🤝', title: 'Middleman Service', desc: 'High value trades can use a verified middleman. Both items held and verified before reshipping.' },
  { icon: '💬', title: 'Discord Native', desc: 'Get trade alerts where you already spend time. The web app is home base, Discord is the feed.' },
];

const plans = [
  { name: 'Free', price: '$0', period: '/mo', protection: 'No protection', fee: '1.5% per trade', features: ['Create profile', 'List cards & sealed', 'Browse all trades', 'Basic trust score'] },
  { name: 'Basic', price: '$4.99', period: '/mo', protection: 'Up to $50', fee: '1% per trade', features: ['Everything in Free', '$50 trade protection', 'Verified badge', 'Priority matching', 'Discord alerts'] },
  { name: 'Pro', price: '$9.99', period: '/mo', protection: 'Up to $200', fee: '0.75% per trade', features: ['Everything in Basic', '$200 trade protection', 'Dispute resolution', 'Middleman access', 'Lower fees'], featured: true },
  { name: 'Elite', price: '$19.99', period: '/mo', protection: 'Up to $500', fee: '0.5% per trade', features: ['Everything in Pro', '$500 trade protection', 'Priority support', 'Insurance integration', 'Lowest fees'] },
];

const faqs = [
  { q: 'How does trade protection work?', a: 'If you follow our verified trade process and get scammed, we compensate you up to your plan\'s protection limit. Claims require evidence — photos, tracking info, and chat logs.' },
  { q: 'How are card values validated?', a: 'When you declare a trade value, we cross-reference it against recent eBay sold listings for that card and condition. Values more than 20% below market get flagged.' },
  { q: 'Who pays the transaction fee?', a: 'Both traders split the fee equally. On a $200 trade at 1%, each trader pays $1. Fees are held in escrow and released when both parties confirm the trade.' },
  { q: 'Can I trade sealed product?', a: 'Yes — booster boxes, ETBs, tins, bundles, and any sealed Pokemon TCG product. Sealed product is often easier to value since condition variables are simpler.' },
  { q: 'What if there\'s a dispute?', a: 'Pro and Elite members get access to our dispute resolution process. Both parties submit evidence and a decision is made within 5 business days.' },
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
          <div className="nav-search">
            <span className="nav-search-icon">🔍</span>
            <input placeholder="Search cards, sets, traders..." />
          </div>
          <div className="nav-links">
            <a href="#how">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-actions">
            {session ? (
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-elevated)' }} onClick={() => setNavDropOpen(o => !o)}>
                  {session.user?.user_metadata?.avatar_url
                    ? <img src={session.user.user_metadata.avatar_url} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>{session.user?.email?.[0]?.toUpperCase()}</div>
                  }
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{session.user?.user_metadata?.full_name?.split(' ')[0] || session.user?.email?.split('@')[0]}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>▾</span>
                </div>
                {navDropOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 12, minWidth: 200, zIndex: 200, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{session.user?.email}</div>
                    {[['Dashboard', '/dashboard'], ['Browse Trades', '/listings'], ['My Trades', '/trades']].map(([label, path]) => (
                      <div key={path} style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'background 0.15s' }} onClick={() => navigate(path)}
                        onMouseEnter={e => e.target.style.background = 'var(--bg-elevated)'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >{label}</div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                      <div style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}>⚡ Upgrade to Pro</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => navigate('/auth')} style={{ padding: '10px 20px', fontSize: 14 }}>Sign In</button>
                <button className="btn-primary" onClick={() => navigate('/auth')} style={{ padding: '10px 20px', fontSize: 14 }}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-tag">🔥 Pokemon TCG Trading Platform</div>
            <h1 className="hero-title">
              The safest way to trade<br />
              <span>Pokemon cards</span><br />
              peer to peer.
            </h1>
            <p className="hero-sub">
              Verified trust scores, financial protection up to $500, and dispute resolution built in.
              No more Discord scams.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate(session ? '/listings' : '/auth')} style={{ padding: '14px 28px', fontSize: 16 }}>
                Browse Trades
              </button>
              <button className="btn-ghost" onClick={() => navigate(session ? '/listings' : '/auth')} style={{ padding: '14px 28px', fontSize: 16 }}>
                List Your Cards
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-cards">
              <div className="hero-card featured">
                <div className="hero-card-icon">⭐</div>
                <div className="hero-card-name">Charizard ex</div>
                <div className="hero-card-val">$287.00</div>
                <div className="hero-card-meta">Prismatic Evolutions · Raw</div>
              </div>
              <div className="hero-card">
                <div className="hero-card-icon">🛡️</div>
                <div className="hero-card-name">Trust Score</div>
                <div className="hero-card-val">98/100</div>
                <div className="hero-card-meta">47 completed trades</div>
              </div>
              <div className="hero-card">
                <div className="hero-card-icon">📦</div>
                <div className="hero-card-name">Prismatic ETB</div>
                <div className="hero-card-val">$149.99</div>
                <div className="hero-card-meta">Sealed · Protected</div>
              </div>
              <div className="hero-card featured">
                <div className="hero-card-icon">✅</div>
                <div className="hero-card-name">Trade Complete</div>
                <div className="hero-card-val">+$42.00</div>
                <div className="hero-card-meta">Fee: $1.50 each</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stats-bar-inner">
          {[['0', 'Trades Completed'], ['$0', 'Protected Volume'], ['0', 'Verified Traders'], ['0%', 'Dispute Rate']].map(([val, label]) => (
            <div key={label} className="stat-bar-item">
              <div className="stat-bar-value">{val}</div>
              <div className="stat-bar-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="how-section" id="how">
        <div className="section-header">
          <div className="section-eyebrow">How It Works</div>
          <h2 className="section-title">Safe trades in 4 simple steps</h2>
          <p className="section-sub">A structured process that protects both parties from start to finish.</p>
        </div>
        <div className="steps-grid">
          {[
            { num: '01', title: 'Create Your Profile', desc: 'Sign up and build your HUMN Trade profile. Your trust score starts at zero and grows with every completed trade.' },
            { num: '02', title: 'List What You Have & Want', desc: 'List cards and sealed product you want to trade. Browse listings from verified traders in the community.' },
            { num: '03', title: 'Match & Agree', desc: 'Get matched with compatible traders. Both parties pay a small fee upfront held in escrow.' },
            { num: '04', title: 'Complete & Review', desc: 'Ship with tracking. Both confirm receipt, fees release, trust scores update, and you leave a review.' },
          ].map(step => (
            <div key={step.num} className="step-card">
              <div className="step-num">{step.num}</div>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="features-inner">
          <div className="section-header">
            <div className="section-eyebrow">Features</div>
            <h2 className="section-title">Built for serious collectors</h2>
            <p className="section-sub">Everything you need to trade safely in one platform.</p>
          </div>
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
        <div className="section-header">
          <div className="section-eyebrow">Pricing</div>
          <h2 className="section-title">Protection that pays for itself</h2>
          <p className="section-sub">One protected trade covers more than a year of Pro membership.</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div key={i} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
              {plan.featured && <div className="plan-badge">Most Popular</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">{plan.price}<span>{plan.period}</span></div>
              <div className="plan-protection"><span className="plan-protection-label">Protection: </span>{plan.protection}</div>
              <div className="plan-fee"><span className="plan-fee-label">Fee: </span>{plan.fee}</div>
              <ul className="plan-features">{plan.features.map((f, j) => <li key={j}>{f}</li>)}</ul>
              <button className={plan.featured ? 'btn-primary' : 'btn-ghost'} onClick={() => navigate(session ? '/dashboard' : '/auth')} style={{ width: '100%' }}>Get Started</button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="faq-inner">
          <div className="section-header">
            <div className="section-eyebrow">FAQ</div>
            <h2 className="section-title">Common questions</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <div className="faq-icon">{openFaq === i ? '−' : '+'}</div>
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
          <h2 className="cta-title">Ready to trade safely?</h2>
          <p className="cta-sub">Join the first Pokemon TCG trading platform with real protection built in.</p>
          <div className="cta-actions">
            <button className="btn-primary" onClick={() => navigate(session ? '/dashboard' : '/auth')} style={{ padding: '14px 32px', fontSize: 16 }}>Start for Free</button>
            <button className="btn-ghost" onClick={() => navigate(session ? '/listings' : '/auth')} style={{ padding: '14px 32px', fontSize: 16 }}>Browse Trades</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }} />
            HUMN <span>TRADE</span>
          </div>
          <div className="footer-links">
            <a href="https://x.com/UseHUMN" target="_blank" rel="noreferrer">Twitter</a>
            <a href="https://humnbot.com" target="_blank" rel="noreferrer">HUMN Bot</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer-copy">© 2025 HUMN Trade</div>
        </div>
      </footer>
    </div>
  );
}
