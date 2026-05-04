import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import './Profile.css';

export default function Profile({ session }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const isOwn = id === session?.user?.id;

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchProfile() {
    setLoading(true);
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', id).single();
    setProfile(prof);
    setUsername(prof?.username || '');

    const { data: lists } = await supabase.from('listings').select('*').eq('user_id', id).eq('active', true).order('created_at', { ascending: false });
    setListings(lists || []);

    const { data: revs } = await supabase.from('reviews').select('*, reviewer:reviewer_id(username, avatar_url)').eq('reviewee_id', id).order('created_at', { ascending: false });
    setReviews(revs || []);

    setLoading(false);
  }

  async function saveUsername() {
    setSaving(true);
    await supabase.from('profiles').update({ username }).eq('id', session.user.id);
    setProfile(p => ({ ...p, username }));
    setEditing(false);
    setSaving(false);
  }

  const trustLabel = (score) => {
    if (score >= 80) return { label: 'Trusted', cls: 'trust-high' };
    if (score >= 40) return { label: 'Building', cls: 'trust-mid' };
    return { label: 'New', cls: 'trust-low' };
  };

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

  const navItems = [
    { icon: '◈', label: 'Dashboard', path: '/dashboard' },
    { icon: '▣', label: 'Browse Trades', path: '/listings' },
    { icon: '◎', label: 'My Trades', path: '/trades' },
    { icon: '◐', label: 'My Profile', path: `/profile/${session?.user?.id}`, active: isOwn },
  ];

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const trust = trustLabel(profile?.trust_score || 0);

  return (
    <div className="profile-page">
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

      <main className="profile-main">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" className="profile-avatar" />
              : <div className="profile-avatar-initial">{profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}</div>
            }
            <div className={`profile-trust-badge ${trust.cls}`}>{trust.label}</div>
          </div>

          <div className="profile-info">
            {editing ? (
              <div className="profile-edit-row">
                <input className="field-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Set username" style={{ width: 240 }} />
                <button className="btn-primary" onClick={saveUsername} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            ) : (
              <div className="profile-name-row">
                <h1 className="profile-name">{profile?.username || 'Unnamed Trader'}</h1>
                {isOwn && <button className="btn-ghost" onClick={() => setEditing(true)} style={{ fontSize: 12, padding: '6px 16px' }}>Edit</button>}
              </div>
            )}
            <div className="profile-email">{profile?.email}</div>
            <div className="profile-meta">
              Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          {!isOwn && (
            <button className="btn-primary" onClick={() => navigate('/listings')}>Trade With Me</button>
          )}
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-label">Trust Score</div>
            <div className={`profile-stat-value ${trust.cls}`}>{profile?.trust_score || 0}</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-label">Trades Completed</div>
            <div className="profile-stat-value">{profile?.trades_completed || 0}</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-label">Avg Rating</div>
            <div className="profile-stat-value">{avgRating ? `${avgRating} ★` : '—'}</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-label">Plan</div>
            <div className="profile-stat-value" style={{ color: 'var(--green)' }}>{profile?.plan?.toUpperCase() || 'FREE'}</div>
          </div>
        </div>

        {/* Active Listings */}
        <div className="profile-section">
          <div className="profile-section-label">Active Listings ({listings.length})</div>
          {listings.length === 0 ? (
            <div className="profile-empty">No active listings</div>
          ) : (
            <div className="profile-listings">
              {listings.map(l => (
                <div key={l.id} className="profile-listing">
                  <div className="listing-tags">
                    <div className={`tag ${l.type === 'have' ? '' : 'tag-blue'}`}>{l.type === 'have' ? 'HAVE' : 'WANT'}</div>
                    <div className="tag tag-gold">{l.item_type.toUpperCase()}</div>
                  </div>
                  <div className="profile-listing-name">{l.item_name}</div>
                  {l.set_name && <div className="profile-listing-set">{l.set_name}</div>}
                  <div className="profile-listing-meta">{l.condition} · Qty {l.quantity}</div>
                  {l.estimated_value && <div className="profile-listing-value">${l.estimated_value}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="profile-section">
          <div className="profile-section-label">Reviews ({reviews.length})</div>
          {reviews.length === 0 ? (
            <div className="profile-empty">No reviews yet</div>
          ) : (
            <div className="profile-reviews">
              {reviews.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    <div className="review-reviewer">
                      {r.reviewer?.avatar_url
                        ? <img src={r.reviewer.avatar_url} alt="reviewer" className="review-avatar" />
                        : <div className="review-avatar-initial">{r.reviewer?.username?.[0]?.toUpperCase() || '?'}</div>
                      }
                      <span>{r.reviewer?.username || 'Anonymous'}</span>
                    </div>
                    <div className="review-rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  {r.comment && <div className="review-comment">{r.comment}</div>}
                  <div className="review-date">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
