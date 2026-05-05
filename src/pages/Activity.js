import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Activity.css';

const FILTER_OPTIONS = ['All', 'Trades', 'Listings', 'Offers'];

export default function Activity({ session }) {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch recent completed trades
      const { data: trades } = await supabase
        .from('trades')
        .select('*, initiator:initiator_id(username, avatar_url, trust_score), receiver:receiver_id(username, avatar_url, trust_score)')
        .order('created_at', { ascending: false })
        .limit(30);

      // Fetch recent listings
      const { data: listings } = await supabase
        .from('listings')
        .select('*, profiles(username, avatar_url, trust_score)')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(30);

      // Fetch recent offers
      const { data: offers } = await supabase
        .from('offers')
        .select('*, from_user:from_user_id(username, avatar_url), listing:listing_id(item_name, estimated_value, set_name)')
        .order('created_at', { ascending: false })
        .limit(20);

      const all = [
        ...(trades || []).map(t => ({ ...t, _type: 'trade', _time: t.created_at })),
        ...(listings || []).map(l => ({ ...l, _type: 'listing', _time: l.created_at })),
        ...(offers || []).map(o => ({ ...o, _type: 'offer', _time: o.created_at })),
      ].sort((a, b) => new Date(b._time) - new Date(a._time));

      setActivities(all);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActivity();
    // Poll for new activity every 30 seconds
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trades' }, fetchActivity)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listings' }, fetchActivity)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'offers' }, fetchActivity)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchActivity]);

  const filtered = activities.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'Trades') return a._type === 'trade';
    if (filter === 'Listings') return a._type === 'listing';
    if (filter === 'Offers') return a._type === 'offer';
    return true;
  });

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  function renderActivity(item) {
    if (item._type === 'trade') {
      const initiator = item.initiator?.username || 'Trader';
      const receiver = item.receiver?.username || 'Trader';
      const statusColor = item.status === 'completed' ? 'tag' : item.status === 'pending' ? 'tag tag-gold' : 'tag tag-red';
      return (
        <div key={item.id} className="activity-item">
          <div className="activity-icon trade-icon">🤝</div>
          <div className="activity-body">
            <div className="activity-text">
              <span className="activity-user" onClick={() => navigate(`/profile/${item.initiator_id}`)}>{initiator}</span>
              {' '}{item.status === 'completed' ? 'completed a trade' : 'started a trade'}{' with '}
              <span className="activity-user" onClick={() => navigate(`/profile/${item.receiver_id}`)}>{receiver}</span>
              {item.trade_value && <span className="activity-value"> · ${item.trade_value}</span>}
            </div>
            <div className="activity-meta">
              <div className={statusColor}>{item.status.toUpperCase()}</div>
              <span className="activity-time">{timeAgo(item._time)}</span>
            </div>
          </div>
          <div className="activity-avatars">
            <AvatarStack users={[item.initiator, item.receiver]} />
          </div>
        </div>
      );
    }

    if (item._type === 'listing') {
      const user = item.profiles?.username || 'Trader';
      const isVerified = (item.profiles?.trust_score || 0) >= 80;
      const action = item.type === 'have' ? 'is offering' : 'is looking for';
      return (
        <div key={item.id} className="activity-item">
          <div className="activity-icon listing-icon">📋</div>
          <div className="activity-body">
            <div className="activity-text">
              <span className="activity-user" onClick={() => navigate(`/profile/${item.user_id}`)}>{user}</span>
              {isVerified && <span className="verified-badge">✓</span>}
              {` ${action} `}
              <span className="activity-card">{item.item_name}</span>
              {item.set_name && <span className="activity-set"> · {item.set_name}</span>}
              {item.estimated_value && <span className="activity-value"> · ${item.estimated_value}</span>}
            </div>
            <div className="activity-meta">
              <div className={`tag ${item.type === 'have' ? '' : 'tag-blue'}`}>{item.type === 'have' ? 'HAVE' : 'WANT'}</div>
              {item.item_type === 'sealed' && <div className="tag tag-gold">SEALED</div>}
              <span className="activity-time">{timeAgo(item._time)}</span>
            </div>
          </div>
          <div className="activity-avatars">
            <UserAvatar user={item.profiles} />
          </div>
        </div>
      );
    }

    if (item._type === 'offer') {
      const user = item.from_user?.username || 'Trader';
      return (
        <div key={item.id} className="activity-item">
          <div className="activity-icon offer-icon">💬</div>
          <div className="activity-body">
            <div className="activity-text">
              <span className="activity-user">{user}</span>
              {' made an offer on '}
              <span className="activity-card">{item.listing?.item_name || 'a listing'}</span>
              {item.listing?.estimated_value && <span className="activity-value"> · ${item.listing.estimated_value}</span>}
            </div>
            <div className="activity-meta">
              <div className="tag tag-gold">OFFER</div>
              <span className="activity-time">{timeAgo(item._time)}</span>
            </div>
          </div>
          <div className="activity-avatars">
            <UserAvatar user={item.from_user} />
          </div>
        </div>
      );
    }

    return null;
  }

  const navItems = [
    { icon: '◈', label: 'Dashboard', path: '/dashboard' },
    { icon: '▣', label: 'Browse Trades', path: '/listings' },
    { icon: '⚡', label: 'Activity', path: '/activity', active: true },
    { icon: '◎', label: 'My Trades', path: '/trades' },
    { icon: '🃏', label: 'Browse Sets', path: '/sets' },
    { icon: '◐', label: 'My Profile', path: `/profile/${session?.user?.id}` },
  ];

  return (
    <div className="activity-page">
      <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        <div className="sidebar-logo" onClick={() => navigate('/')}>
          <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN" className="sidebar-logo-img" />
          HUMN <span>Trade</span>
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
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="btn-ghost" style={{ width: '100%', fontSize: 13, padding: '9px' }}>Sign Out</button>
        </div>
      </aside>

      <main className="activity-main">
        <div className="activity-header">
          <div>
            <h1 className="activity-title">Activity</h1>
            <p className="activity-sub">Live feed of trades, listings, and offers across HUMN Trade</p>
          </div>
          <div className="activity-live">
            <div className="live-dot" />
            Live
          </div>
        </div>

        <div className="activity-filters">
          {FILTER_OPTIONS.map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div className="activity-loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="activity-empty">
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <p>No activity yet — be the first to trade!</p>
            <button className="btn-primary" onClick={() => navigate('/listings')} style={{ marginTop: 16 }}>Browse Listings</button>
          </div>
        ) : (
          <div className="activity-feed">
            {filtered.map(item => renderActivity(item))}
          </div>
        )}
      </main>
    </div>
  );
}

function UserAvatar({ user }) {
  if (!user) return null;
  if (user.avatar_url) return <img src={user.avatar_url} alt="" className="activity-avatar" />;
  return <div className="activity-avatar-init">{user.username?.[0]?.toUpperCase() || '?'}</div>;
}

function AvatarStack({ users }) {
  return (
    <div className="avatar-stack">
      {users.filter(Boolean).slice(0, 2).map((u, i) => (
        <div key={i} className="avatar-stack-item" style={{ zIndex: 2 - i, marginLeft: i > 0 ? -8 : 0 }}>
          <UserAvatar user={u} />
        </div>
      ))}
    </div>
  );
}
