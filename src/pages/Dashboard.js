import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Dashboard.css';

export default function Dashboard({ session }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [trades, setTrades] = useState([]);
  const [listings, setListings] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setProfile(prof);

    const { data: tradeData } = await supabase.from('trades')
      .select('*')
      .or(`initiator_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false })
      .limit(5);
    setTrades(tradeData || []);

    const { data: listData } = await supabase.from('listings')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(5);
    setListings(listData || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  const trustColor = (score) => {
    if (score >= 80) return 'trust-high';
    if (score >= 40) return 'trust-mid';
    return 'trust-low';
  };

  const navItems = [
    { icon: '◈', label: 'Dashboard', path: '/dashboard', active: true },
    { icon: '🃏', label: 'Browse Sets', path: '/sets' },
    { icon: '▣', label: 'Browse Trades', path: '/listings' },
    { icon: '◎', label: 'My Trades', path: '/trades' },
    { icon: '◐', label: 'My Profile', path: `/profile/${session?.user?.id}` },
  ];

  return (
    <div className="dash">
      <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
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
          {profile && (
            <div className="sidebar-profile">
              <div className={`sidebar-trust ${trustColor(profile.trust_score)}`}>
                Trust Score: {profile.trust_score}
              </div>
              <div className="sidebar-plan">{profile.plan?.toUpperCase() || 'FREE'} PLAN</div>
              <button className="btn-primary" style={{ width: '100%', marginTop: 12, fontSize: 12, padding: '10px' }}>Upgrade</button>
              <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', marginTop: 8, fontSize: 12, padding: '10px' }}>Sign Out</button>
            </div>
          )}
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-sub">Welcome back{profile?.username ? `, ${profile.username}` : ''}</p>
          </div>
          <div className="dash-user">
            {session?.user?.user_metadata?.avatar_url
              ? <img src={session.user.user_metadata.avatar_url} alt="avatar" className="dash-avatar" />
              : <div className="dash-avatar-initial">{session?.user?.email?.[0]?.toUpperCase()}</div>
            }
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat">
            <div className="dash-stat-label">Trust Score</div>
            <div className={`dash-stat-value ${trustColor(profile?.trust_score || 0)}`}>{profile?.trust_score || 0}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Trades Completed</div>
            <div className="dash-stat-value">{profile?.trades_completed || 0}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Active Listings</div>
            <div className="dash-stat-value">{listings.length}</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-label">Plan</div>
            <div className="dash-stat-value" style={{ color: 'var(--green)' }}>{profile?.plan?.toUpperCase() || 'FREE'}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dash-section">
          <div className="dash-section-label">Quick Actions</div>
          <div className="dash-actions">
            <div className="dash-action" onClick={() => navigate('/listings')}>
              <div className="dash-action-icon">▣</div>
              <div className="dash-action-title">Browse Trades</div>
              <div className="dash-action-desc">Find cards and sealed product to trade for</div>
              <div className="dash-action-arrow">→</div>
            </div>
            <div className="dash-action" onClick={() => navigate('/listings?tab=create')}>
              <div className="dash-action-icon">◈</div>
              <div className="dash-action-title">Create Listing</div>
              <div className="dash-action-desc">List what you have and what you want</div>
              <div className="dash-action-arrow">→</div>
            </div>
            <div className="dash-action" onClick={() => navigate('/trades')}>
              <div className="dash-action-icon">◎</div>
              <div className="dash-action-title">My Trades</div>
              <div className="dash-action-desc">Manage your active and pending trades</div>
              <div className="dash-action-arrow">→</div>
            </div>
            <div className="dash-action" onClick={() => navigate(`/profile/${session?.user?.id}`)}>
              <div className="dash-action-icon">◐</div>
              <div className="dash-action-title">My Profile</div>
              <div className="dash-action-desc">View your trust score and trade history</div>
              <div className="dash-action-arrow">→</div>
            </div>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="dash-section">
          <div className="dash-section-label">My Active Listings</div>
          {listings.length === 0 ? (
            <div className="dash-empty">
              <p>No active listings</p>
              <button className="btn-primary" onClick={() => navigate('/listings?tab=create')} style={{ marginTop: 16 }}>Create First Listing</button>
            </div>
          ) : (
            <div className="dash-list">
              {listings.map(l => (
                <div key={l.id} className="dash-list-item">
                  <div className={`tag ${l.type === 'have' ? '' : 'tag-blue'}`}>{l.type === 'have' ? 'HAVE' : 'WANT'}</div>
                  <div className="dash-list-name">{l.item_name}</div>
                  <div className="dash-list-meta">{l.item_type} · {l.condition || 'N/A'}</div>
                  {l.estimated_value && <div className="dash-list-value">${l.estimated_value}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Trades */}
        <div className="dash-section">
          <div className="dash-section-label">Recent Trades</div>
          {trades.length === 0 ? (
            <div className="dash-empty">
              <p>No trades yet</p>
              <button className="btn-ghost" onClick={() => navigate('/listings')} style={{ marginTop: 16 }}>Browse Listings</button>
            </div>
          ) : (
            <div className="dash-list">
              {trades.map(t => (
                <div key={t.id} className="dash-list-item">
                  <div className={`tag ${t.status === 'completed' ? '' : t.status === 'pending' ? 'tag-gold' : 'tag-red'}`}>
                    {t.status.toUpperCase()}
                  </div>
                  <div className="dash-list-name">Trade #{t.id.slice(0, 8)}</div>
                  <div className="dash-list-meta">{new Date(t.created_at).toLocaleDateString()}</div>
                  {t.trade_value && <div className="dash-list-value">${t.trade_value}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
