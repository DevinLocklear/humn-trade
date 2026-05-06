import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Trades.css';

export default function Trades({ session }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('offers');
  const [offers, setOffers] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counterModal, setCounterModal] = useState(null);
  const [counterForm, setCounterForm] = useState({ message: '', value: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  async function fetchAll() {
    setLoading(true);
    const [{ data: offerData }, { data: tradeData }] = await Promise.all([
      supabase.from('offers')
        .select('*, listing:listing_id(item_name, estimated_value, set_name, type), from_user:from_user_id(username, avatar_url, trust_score), offer_item:offer_listing_id(item_name, estimated_value, set_name)')
        .or(`from_user_id.eq.${session.user.id},to_user_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false }),
      supabase.from('trades')
        .select('*, initiator:initiator_id(username, avatar_url), receiver:receiver_id(username, avatar_url)')
        .or(`initiator_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false }),
    ]);
    setOffers(offerData || []);
    setTrades(tradeData || []);
    setLoading(false);
  }

  async function respondToOffer(offer, response) {
    await supabase.from('offers').update({ status: response }).eq('id', offer.id);
    if (response === 'accepted') {
      await supabase.from('trades').insert({
        initiator_id: offer.from_user_id,
        receiver_id: offer.to_user_id,
        initiator_listing_id: offer.offer_listing_id,
        receiver_listing_id: offer.listing_id,
        trade_value: offer.listing?.estimated_value || null,
        status: 'active',
        initiator_item: offer.offer_item?.item_name || null,
        receiver_item: offer.listing?.item_name || null,
      });
    }
    fetchAll();
  }

  async function sendCounter(e) {
    e.preventDefault();
    await supabase.from('offers').update({
      status: 'countered',
      counter_message: counterForm.message,
      counter_value: counterForm.value ? parseFloat(counterForm.value) : null,
    }).eq('id', counterModal.id);
    setCounterModal(null);
    setCounterForm({ message: '', value: '' });
    fetchAll();
  }

  async function confirmTrade(trade) {
    const isInitiator = trade.initiator_id === session.user.id;
    const update = isInitiator ? { initiator_confirmed: true } : { receiver_confirmed: true };
    await supabase.from('trades').update(update).eq('id', trade.id);
    if ((isInitiator && trade.receiver_confirmed) || (!isInitiator && trade.initiator_confirmed)) {
      await supabase.from('trades').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', trade.id);
    }
    fetchAll();
  }

  function timeAgo(date) {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  const myOffers = offers.filter(o => o.from_user_id === session.user.id);
  const receivedOffers = offers.filter(o => o.to_user_id === session.user.id);
  const pendingOffers = receivedOffers.filter(o => o.status === 'pending');

  const statusColor = (s) => s === 'accepted' ? 'tag tag-green' : s === 'declined' ? 'tag tag-red' : s === 'countered' ? 'tag tag-gold' : 'tag tag-gold';
  const tradeStatusColor = (s) => s === 'completed' ? 'tag tag-green' : s === 'active' ? 'tag' : 'tag tag-red';

  const navItems = [
    { icon: '◈', label: 'Dashboard', path: '/dashboard' },
    { icon: '▣', label: 'Browse Trades', path: '/listings' },
    { icon: '⚡', label: 'Activity', path: '/activity' },
    { icon: '◎', label: 'My Trades', path: '/trades', active: true },
    { icon: '🃏', label: 'Browse Sets', path: '/sets' },
    { icon: '◐', label: 'My Profile', path: `/profile/${session?.user?.id}` },
  ];

  return (
    <div className="trades-page">
      <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        <div className="sidebar-logo" onClick={() => navigate('/')}><img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN" className="sidebar-logo-img" />HUMN <span>Trade</span></div>
        <nav className="sidebar-nav">{navItems.map((item, i) => (<div key={i} className={`sidebar-item ${item.active ? 'active' : ''}`} onClick={() => navigate(item.path)}><span className="sidebar-icon">{item.icon}</span><span className="sidebar-label">{item.label}</span></div>))}</nav>
        <div className="sidebar-footer"><button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="btn-ghost" style={{ width: '100%', fontSize: 13, padding: '9px' }}>Sign Out</button></div>
      </aside>

      <main className="trades-main">
        <div className="trades-header">
          <h1 className="trades-title">My Trades</h1>
          <p className="trades-sub">Manage your offers and active trades</p>
        </div>

        <div className="listings-tabs">
          <button className={`listings-tab ${tab === 'offers' ? 'active' : ''}`} onClick={() => setTab('offers')}>
            💬 Received Offers {pendingOffers.length > 0 && <span className="tab-badge">{pendingOffers.length}</span>}
          </button>
          <button className={`listings-tab ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>
            📤 Sent Offers <span className="tab-count">{myOffers.length}</span>
          </button>
          <button className={`listings-tab ${tab === 'trades' ? 'active' : ''}`} onClick={() => setTab('trades')}>
            🤝 Active Trades <span className="tab-count">{trades.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="trades-loading"><div className="spinner" /></div>
        ) : (
          <>
            {/* Received Offers */}
            {tab === 'offers' && (
              receivedOffers.length === 0 ? (
                <div className="trades-empty"><p>No offers received yet</p><button className="btn-ghost" onClick={() => navigate('/listings')} style={{ marginTop: 16 }}>Browse Listings</button></div>
              ) : (
                <div className="trades-list">
                  {receivedOffers.map(offer => (
                    <div key={offer.id} className="offer-card">
                      <div className="offer-card-header">
                        <div className="offer-from">
                          {offer.from_user?.avatar_url
                            ? <img src={offer.from_user.avatar_url} alt="" className="offer-avatar" />
                            : <div className="offer-avatar-init">{offer.from_user?.username?.[0]?.toUpperCase()}</div>
                          }
                          <div>
                            <div className="offer-from-name" onClick={() => navigate(`/profile/${offer.from_user_id}`)}>{offer.from_user?.username || 'Trader'}</div>
                            <div className="offer-time">{timeAgo(offer.created_at)}</div>
                          </div>
                        </div>
                        <div className={statusColor(offer.status)}>{offer.status.toUpperCase()}</div>
                      </div>

                      <div className="offer-details">
                        <div className="offer-item">
                          <div className="offer-item-label">On your item</div>
                          <div className="offer-item-name">{offer.listing?.item_name}</div>
                          {offer.listing?.estimated_value && <div className="offer-item-val">${offer.listing.estimated_value}</div>}
                        </div>
                        {offer.offer_item && (
                          <>
                            <div className="offer-arrow">⇄</div>
                            <div className="offer-item">
                              <div className="offer-item-label">They're offering</div>
                              <div className="offer-item-name">{offer.offer_item.item_name}</div>
                              {offer.offer_item.estimated_value && <div className="offer-item-val">${offer.offer_item.estimated_value}</div>}
                            </div>
                          </>
                        )}
                      </div>

                      {offer.message && <div className="offer-message">"{offer.message}"</div>}

                      {offer.status === 'countered' && offer.counter_message && (
                        <div className="offer-counter">
                          <div className="offer-counter-label">Counter offer sent</div>
                          <div className="offer-counter-message">{offer.counter_message}</div>
                          {offer.counter_value && <div className="offer-counter-val">Counter value: ${offer.counter_value}</div>}
                        </div>
                      )}

                      {offer.status === 'pending' && (
                        <div className="offer-actions">
                          <button className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => respondToOffer(offer, 'accepted')}>✓ Accept</button>
                          <button className="btn-ghost" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => { setCounterModal(offer); setCounterForm({ message: '', value: '' }); }}>⇄ Counter</button>
                          <button className="btn-danger" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => respondToOffer(offer, 'declined')}>✕ Decline</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Sent Offers */}
            {tab === 'sent' && (
              myOffers.length === 0 ? (
                <div className="trades-empty"><p>No offers sent yet</p><button className="btn-primary" onClick={() => navigate('/listings')} style={{ marginTop: 16 }}>Browse Listings</button></div>
              ) : (
                <div className="trades-list">
                  {myOffers.map(offer => (
                    <div key={offer.id} className="offer-card">
                      <div className="offer-card-header">
                        <div className="offer-on">Offer on <strong>{offer.listing?.item_name}</strong></div>
                        <div className={statusColor(offer.status)}>{offer.status.toUpperCase()}</div>
                      </div>
                      {offer.offer_item && (
                        <div className="offer-details">
                          <div className="offer-item">
                            <div className="offer-item-label">You offered</div>
                            <div className="offer-item-name">{offer.offer_item.item_name}</div>
                            {offer.offer_item.estimated_value && <div className="offer-item-val">${offer.offer_item.estimated_value}</div>}
                          </div>
                        </div>
                      )}
                      {offer.message && <div className="offer-message">"{offer.message}"</div>}
                      {offer.status === 'countered' && offer.counter_message && (
                        <div className="offer-counter">
                          <div className="offer-counter-label">They countered</div>
                          <div className="offer-counter-message">{offer.counter_message}</div>
                          {offer.counter_value && <div className="offer-counter-val">Counter value: ${offer.counter_value}</div>}
                        </div>
                      )}
                      <div className="offer-time-bottom">{timeAgo(offer.created_at)}</div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Active Trades */}
            {tab === 'trades' && (
              trades.length === 0 ? (
                <div className="trades-empty"><p>No active trades</p></div>
              ) : (
                <div className="trades-list">
                  {trades.map(trade => {
                    const isInitiator = trade.initiator_id === session.user.id;
                    const partner = isInitiator ? trade.receiver : trade.initiator;
                    const myConfirmed = isInitiator ? trade.initiator_confirmed : trade.receiver_confirmed;
                    return (
                      <div key={trade.id} className="trade-card" onClick={() => navigate(`/trade/${trade.id}`)} style={{ cursor: 'pointer' }}>
                        <div className="trade-card-header">
                          <div className="trade-id">Trade #{trade.id.slice(0, 8)}</div>
                          <div className={tradeStatusColor(trade.status)}>{trade.status.toUpperCase()}</div>
                        </div>
                        <div className="trade-parties">
                          <div className="trade-party"><div className="trade-party-label">Your role</div><div className="trade-party-role">{isInitiator ? 'Initiator' : 'Receiver'}</div></div>
                          <div className="trade-vs">⇄</div>
                          <div className="trade-party"><div className="trade-party-label">Trading with</div><div className="trade-party-name" onClick={() => navigate(`/profile/${isInitiator ? trade.receiver_id : trade.initiator_id}`)}>{partner?.username || 'Trader'}</div></div>
                        </div>
                        {trade.trade_value && <div className="trade-value">Value: <span>${trade.trade_value}</span></div>}
                        <div className="trade-confirmation">
                          <div className={`confirm-dot ${trade.initiator_confirmed ? 'confirmed' : ''}`}>Initiator {trade.initiator_confirmed ? '✓' : '○'}</div>
                          <div className={`confirm-dot ${trade.receiver_confirmed ? 'confirmed' : ''}`}>Receiver {trade.receiver_confirmed ? '✓' : '○'}</div>
                        </div>
                        <div className="trade-actions">
                          <button className="btn-primary" onClick={(e) => { e.stopPropagation(); navigate(`/trade/${trade.id}`); }} style={{ fontSize: 13, padding: '8px 16px' }}>
                            Open Trade Room →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </>
        )}

        {/* Counter Modal */}
        {counterModal && (
          <div className="modal-overlay" onClick={() => setCounterModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Counter Offer</h2>
                <button className="modal-close" onClick={() => setCounterModal(null)}>✕</button>
              </div>
              <form onSubmit={sendCounter} className="modal-form">
                <div className="offer-details" style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                  <div>Original offer on <strong>{counterModal.listing?.item_name}</strong></div>
                  {counterModal.message && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>"{counterModal.message}"</div>}
                </div>
                <div className="field">
                  <label className="field-label">Your counter message *</label>
                  <textarea className="field-input" rows={3} placeholder="Explain your counter offer..." value={counterForm.message} onChange={e => setCounterForm(f => ({...f, message: e.target.value}))} required style={{ resize: 'vertical' }} />
                </div>
                <div className="field">
                  <label className="field-label">Counter value ($) — optional</label>
                  <input className="field-input" type="number" step="0.01" placeholder="e.g. 250.00" value={counterForm.value} onChange={e => setCounterForm(f => ({...f, value: e.target.value}))} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setCounterModal(null)}>Cancel</button>
                  <button type="submit" className="btn-primary">Send Counter →</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
