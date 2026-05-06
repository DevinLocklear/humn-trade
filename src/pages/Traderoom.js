import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import './TradeRoom.css';

const STEPS = ['Accepted', 'Shipping', 'In Transit', 'Received', 'Complete'];

export default function TradeRoom({ session }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState('');
  const [submittingTracking, setSubmittingTracking] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { fetchTrade(); }, [id]); // eslint-disable-line

  async function fetchTrade() {
    setLoading(true);
    const { data } = await supabase
      .from('trades')
      .select('*, initiator:initiator_id(id, username, avatar_url, trust_score, email), receiver:receiver_id(id, username, avatar_url, trust_score, email)')
      .eq('id', id)
      .single();
    setTrade(data);

    // Check if already reviewed
    const { data: rev } = await supabase
      .from('reviews')
      .select('id')
      .eq('trade_id', id)
      .eq('reviewer_id', session.user.id)
      .single();
    setReviewed(!!rev);
    setLoading(false);
  }

  const isInitiator = trade?.initiator_id === session.user.id;
  const me = isInitiator ? trade?.initiator : trade?.receiver;
  const them = isInitiator ? trade?.receiver : trade?.initiator;
  const myTracking = isInitiator ? trade?.initiator_tracking : trade?.receiver_tracking;
  const theirTracking = isInitiator ? trade?.receiver_tracking : trade?.initiator_tracking;
  const myItem = isInitiator ? trade?.initiator_item : trade?.receiver_item;
  const theirItem = isInitiator ? trade?.receiver_item : trade?.initiator_item;
  const myConfirmed = isInitiator ? trade?.initiator_confirmed : trade?.receiver_confirmed;
  const theirConfirmed = isInitiator ? trade?.receiver_confirmed : trade?.initiator_confirmed;

  function getStep() {
    if (!trade) return 0;
    if (trade.status === 'completed') return 4;
    if (trade.initiator_confirmed && trade.receiver_confirmed) return 4;
    if (trade.initiator_confirmed || trade.receiver_confirmed) return 3;
    if (trade.initiator_tracking && trade.receiver_tracking) return 2;
    if (trade.initiator_tracking || trade.receiver_tracking) return 2;
    return 1;
  }

  async function submitTracking(e) {
    e.preventDefault();
    setSubmittingTracking(true);
    const update = isInitiator ? { initiator_tracking: tracking } : { receiver_tracking: tracking };
    await supabase.from('trades').update(update).eq('id', id);
    setTracking('');
    fetchTrade();
    setSubmittingTracking(false);
  }

  async function confirmReceipt() {
    setConfirming(true);
    const update = isInitiator ? { initiator_confirmed: true } : { receiver_confirmed: true };
    await supabase.from('trades').update(update).eq('id', id);

    // Check if both confirmed — complete the trade
    const bothConfirmed = isInitiator ? trade.receiver_confirmed : trade.initiator_confirmed;
    if (bothConfirmed) {
      await supabase.from('trades').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id);
      // Increment trust scores
      await supabase.from('profiles').update({ trades_completed: (trade.initiator?.trades_completed || 0) + 1 }).eq('id', trade.initiator_id);
      await supabase.from('profiles').update({ trades_completed: (trade.receiver?.trades_completed || 0) + 1 }).eq('id', trade.receiver_id);
      // Update trust score (+5 per trade)
      await supabase.rpc('increment', { row_id: trade.initiator_id, table: 'profiles', column: 'trust_score', amount: 5 });
      await supabase.rpc('increment', { row_id: trade.receiver_id, table: 'profiles', column: 'trust_score', amount: 5 });
    }
    fetchTrade();
    setConfirming(false);
    if (bothConfirmed) setShowReview(true);
  }

  async function submitReview(e) {
    e.preventDefault();
    setSubmittingReview(true);
    await supabase.from('reviews').insert({
      trade_id: id,
      reviewer_id: session.user.id,
      reviewee_id: them?.id,
      rating: review.rating,
      comment: review.comment || null,
    });
    setReviewed(true);
    setShowReview(false);
    setSubmittingReview(false);
  }

  const step = getStep();

  const navItems = [
    { icon: '◈', label: 'Dashboard', path: '/dashboard' },
    { icon: '▣', label: 'Browse Trades', path: '/listings' },
    { icon: '⚡', label: 'Activity', path: '/activity' },
    { icon: '◎', label: 'My Trades', path: '/trades', active: true },
    { icon: '🃏', label: 'Browse Sets', path: '/sets' },
    { icon: '◐', label: 'My Profile', path: `/profile/${session?.user?.id}` },
  ];

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!trade) return <div className="page-loading"><p>Trade not found</p></div>;

  return (
    <div className="trade-room-page">
      <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        <div className="sidebar-logo" onClick={() => navigate('/')}><img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN" className="sidebar-logo-img" />HUMN <span>Trade</span></div>
        <nav className="sidebar-nav">{navItems.map((item, i) => (<div key={i} className={`sidebar-item ${item.active ? 'active' : ''}`} onClick={() => navigate(item.path)}><span className="sidebar-icon">{item.icon}</span><span className="sidebar-label">{item.label}</span></div>))}</nav>
        <div className="sidebar-footer"><button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="btn-ghost" style={{ width: '100%', fontSize: 13, padding: '9px' }}>Sign Out</button></div>
      </aside>

      <main className="trade-room-main">
        <div className="trade-room-back">
          <button className="btn-ghost" onClick={() => navigate('/trades')} style={{ padding: '8px 16px', fontSize: 13 }}>← My Trades</button>
          <div className={`trade-status-badge ${trade.status === 'completed' ? 'complete' : 'active'}`}>
            {trade.status === 'completed' ? '✓ Trade Complete' : '● Active Trade'}
          </div>
        </div>

        <div className="trade-room-header">
          <h1 className="trade-room-title">Trade Room</h1>
          <div className="trade-room-id">#{id.slice(0, 8)}</div>
        </div>

        {/* Progress steps */}
        <div className="trade-steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`trade-step ${i <= step ? 'done' : ''} ${i === step ? 'current' : ''}`}>
                <div className="trade-step-dot">{i < step ? '✓' : i + 1}</div>
                <div className="trade-step-label">{s}</div>
              </div>
              {i < STEPS.length - 1 && <div className={`trade-step-line ${i < step ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Exchange cards */}
        <div className="trade-exchange">
          <div className="trade-party-card mine">
            <div className="trade-party-header">
              <div className="trade-party-you">You</div>
              {me?.avatar_url
                ? <img src={me.avatar_url} alt="" className="trade-party-avatar" />
                : <div className="trade-party-avatar-init">{me?.username?.[0]?.toUpperCase()}</div>
              }
              <div className="trade-party-name">{me?.username || 'You'}</div>
            </div>
            <div className="trade-party-item">
              <div className="trade-party-item-label">You're sending</div>
              <div className="trade-party-item-name">{myItem || '—'}</div>
            </div>
            {myTracking ? (
              <div className="tracking-submitted">
                <div className="tracking-label">Tracking submitted</div>
                <div className="tracking-number">{myTracking}</div>
              </div>
            ) : trade.status !== 'completed' && (
              <form onSubmit={submitTracking} className="tracking-form">
                <div className="tracking-form-label">Add tracking number</div>
                <div className="tracking-form-row">
                  <input className="field-input" placeholder="e.g. 9400111899223456789012" value={tracking} onChange={e => setTracking(e.target.value)} required style={{ fontSize: 13 }} />
                  <button type="submit" className="btn-primary" disabled={submittingTracking} style={{ padding: '9px 16px', fontSize: 13, flexShrink: 0 }}>
                    {submittingTracking ? '...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
            {myConfirmed && <div className="confirmed-badge">✓ Receipt Confirmed</div>}
          </div>

          <div className="trade-exchange-middle">
            <div className="trade-exchange-icon">⇄</div>
            {trade.trade_value && <div className="trade-exchange-val">${trade.trade_value}</div>}
          </div>

          <div className="trade-party-card theirs">
            <div className="trade-party-header">
              {them?.avatar_url
                ? <img src={them.avatar_url} alt="" className="trade-party-avatar" />
                : <div className="trade-party-avatar-init">{them?.username?.[0]?.toUpperCase()}</div>
              }
              <div className="trade-party-name">{them?.username || 'Trader'}</div>
              <div className="trade-party-score">{them?.trust_score || 0} ⭐</div>
            </div>
            <div className="trade-party-item">
              <div className="trade-party-item-label">They're sending</div>
              <div className="trade-party-item-name">{theirItem || '—'}</div>
            </div>
            {theirTracking ? (
              <div className="tracking-submitted">
                <div className="tracking-label">Tracking submitted</div>
                <div className="tracking-number">{theirTracking}</div>
              </div>
            ) : (
              <div className="tracking-waiting">Waiting for tracking...</div>
            )}
            {theirConfirmed && <div className="confirmed-badge">✓ Receipt Confirmed</div>}
          </div>
        </div>

        {/* Action area */}
        {trade.status !== 'completed' && (
          <div className="trade-action-area">
            {step >= 2 && !myConfirmed && (
              <div className="trade-action-card">
                <div className="trade-action-title">Did your cards arrive?</div>
                <div className="trade-action-desc">Only confirm receipt once you have physically received the cards and verified their condition.</div>
                <button className="btn-primary" onClick={confirmReceipt} disabled={confirming} style={{ marginTop: 16 }}>
                  {confirming ? 'Confirming...' : '✓ Confirm Receipt'}
                </button>
              </div>
            )}
            {step < 2 && (
              <div className="trade-action-card info">
                <div className="trade-action-title">Next step: Ship your item</div>
                <div className="trade-action-desc">
                  Package your item securely and ship it with a tracked service.
                  Enter your tracking number above so {them?.username} can follow along.
                </div>
                <div className="trade-shipping-tips">
                  <div className="trade-tip">📦 Use a padded envelope or box for protection</div>
                  <div className="trade-tip">🔒 Consider adding insurance for high-value cards</div>
                  <div className="trade-tip">📸 Photograph cards before shipping as evidence</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed state */}
        {trade.status === 'completed' && (
          <div className="trade-complete-card">
            <div className="trade-complete-icon">🎉</div>
            <h2 className="trade-complete-title">Trade Complete!</h2>
            <p className="trade-complete-sub">Both parties confirmed receipt. Trade closed successfully.</p>
            {!reviewed && (
              <button className="btn-primary" onClick={() => setShowReview(true)} style={{ marginTop: 20 }}>
                Leave a Review for {them?.username}
              </button>
            )}
            {reviewed && <div className="reviewed-badge">✓ Review submitted</div>}
          </div>
        )}

        {/* Review modal */}
        {showReview && (
          <div className="modal-overlay" onClick={() => setShowReview(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Review {them?.username}</h2>
                <button className="modal-close" onClick={() => setShowReview(false)}>✕</button>
              </div>
              <form onSubmit={submitReview} className="modal-form">
                <div className="field">
                  <label className="field-label">Rating</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" className={`star-btn ${review.rating >= n ? 'active' : ''}`} onClick={() => setReview(r => ({ ...r, rating: n }))}>★</button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Comment <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 12, color: 'var(--text-muted)' }}>optional</span></label>
                  <textarea className="field-input" rows={3} placeholder="How was the trade? Were they responsive and honest?" value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setShowReview(false)}>Skip</button>
                  <button type="submit" className="btn-primary" disabled={submittingReview}>{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
