import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Trades.css';

export default function Trades({ session }) {
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTrades();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTrades() {
    setLoading(true);
    const { data } = await supabase
      .from('trades')
      .select('*, initiator:initiator_id(username, avatar_url, trust_score), receiver:receiver_id(username, avatar_url, trust_score)')
      .or(`initiator_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false });
    setTrades(data || []);
    setLoading(false);
  }

  async function confirmTrade(trade) {
    const isInitiator = trade.initiator_id === session.user.id;
    const update = isInitiator ? { initiator_confirmed: true } : { receiver_confirmed: true };

    await supabase.from('trades').update(update).eq('id', trade.id);

    // Check if both confirmed
    if ((isInitiator && trade.receiver_confirmed) || (!isInitiator && trade.initiator_confirmed)) {
      await supabase.from('trades').update({
        status: 'completed',
        completed_at: new Date().toISOString()
      }).eq('id', trade.id);

      // Update trust scores
      await supabase.rpc('increment_trust', { user_id: trade.initiator_id });
      await supabase.rpc('increment_trust', { user_id: trade.receiver_id });
    }

    fetchTrades();
  }

  async function cancelTrade(id) {
    await supabase.from('trades').update({ status: 'cancelled' }).eq('id', id);
    fetchTrades();
  }

  const filtered = trades.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const statusColor = (status) => {
    if (status === 'completed') return '';
    if (status === 'pending') return 'tag-gold';
    if (status === 'cancelled') return 'tag-red';
    return 'tag-blue';
  };

  const navItems = [
    { icon: '◈', label: 'Dashboard', path: '/dashboard' },
    { icon: '▣', label: 'Browse Trades', path: '/listings' },
    { icon: '◎', label: 'My Trades', path: '/trades', active: true },
    { icon: '◐', label: 'My Profile', path: `/profile/${session?.user?.id}` },
  ];

  return (
    <div className="trades-page">
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/')}>
          <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          HUMN <span>TRADE</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => (
            <div key={i} className={`sidebar-item ${item.active ? 'active' : ''}`} onClick={() => navigate(item.path)}>
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '10px' }}>Sign Out</button>
        </div>
      </aside>

      <main className="trades-main">
        <div className="trades-header">
          <div>
            <h1 className="trades-title">My Trades</h1>
            <p className="trades-sub">{trades.length} total trades</p>
          </div>
        </div>

        <div className="trades-filters">
          {['all', 'pending', 'active', 'completed', 'cancelled'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="trades-loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="trades-empty">
            <p>No trades found</p>
            <button className="btn-ghost" onClick={() => navigate('/listings')} style={{ marginTop: 16 }}>Browse Listings</button>
          </div>
        ) : (
          <div className="trades-list">
            {filtered.map(trade => {
              const isInitiator = trade.initiator_id === session.user.id;
              const partner = isInitiator ? trade.receiver : trade.initiator;
              const myConfirmed = isInitiator ? trade.initiator_confirmed : trade.receiver_confirmed;

              return (
                <div key={trade.id} className="trade-card">
                  <div className="trade-card-header">
                    <div className="trade-id">Trade #{trade.id.slice(0, 8)}</div>
                    <div className={`tag ${statusColor(trade.status)}`}>{trade.status.toUpperCase()}</div>
                  </div>

                  <div className="trade-parties">
                    <div className="trade-party">
                      <div className="trade-party-label">Your Role</div>
                      <div className="trade-party-role">{isInitiator ? 'Initiator' : 'Receiver'}</div>
                    </div>
                    <div className="trade-vs">⇄</div>
                    <div className="trade-party">
                      <div className="trade-party-label">Trading With</div>
                      <div className="trade-party-name" onClick={() => navigate(`/profile/${isInitiator ? trade.receiver_id : trade.initiator_id}`)}>
                        {partner?.username || 'Unknown Trader'}
                      </div>
                    </div>
                  </div>

                  {trade.trade_value && (
                    <div className="trade-value">
                      Trade Value: <span>${trade.trade_value}</span>
                      {trade.fee_each && <span className="trade-fee"> (Fee: ${trade.fee_each} each)</span>}
                    </div>
                  )}

                  {trade.notes && <div className="trade-notes">{trade.notes}</div>}

                  <div className="trade-confirmation">
                    <div className={`confirm-dot ${trade.initiator_confirmed ? 'confirmed' : ''}`}>
                      Initiator {trade.initiator_confirmed ? '✓' : '○'}
                    </div>
                    <div className={`confirm-dot ${trade.receiver_confirmed ? 'confirmed' : ''}`}>
                      Receiver {trade.receiver_confirmed ? '✓' : '○'}
                    </div>
                  </div>

                  <div className="trade-date">{new Date(trade.created_at).toLocaleDateString()}</div>

                  {trade.status === 'active' && !myConfirmed && (
                    <div className="trade-actions">
                      <button className="btn-primary" onClick={() => confirmTrade(trade)}>Confirm Receipt</button>
                      <button className="btn-danger" onClick={() => cancelTrade(trade.id)}>Cancel Trade</button>
                    </div>
                  )}

                  {trade.status === 'pending' && isInitiator && (
                    <div className="trade-actions">
                      <button className="btn-danger" onClick={() => cancelTrade(trade.id)}>Cancel</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
