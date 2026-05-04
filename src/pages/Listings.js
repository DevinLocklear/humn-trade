import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Listings.css';

const CONDITIONS = ['Raw', 'PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'BGS 10', 'BGS 9.5', 'BGS 9', 'CGC 10', 'CGC 9.5', 'Sealed'];

export default function Listings({ session }) {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all'); // all | have | want | card | sealed
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'have',
    item_type: 'card',
    item_name: '',
    set_name: '',
    condition: 'Raw',
    quantity: 1,
    estimated_value: '',
    notes: '',
  });

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select('*, profiles(username, trust_score, avatar_url)')
      .eq('active', true)
      .order('created_at', { ascending: false });
    setListings(data || []);
    setLoading(false);
  }

  async function createListing(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('listings').insert({
      user_id: session.user.id,
      type: form.type,
      item_type: form.item_type,
      item_name: form.item_name,
      set_name: form.set_name || null,
      condition: form.condition,
      quantity: parseInt(form.quantity) || 1,
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
      notes: form.notes || null,
    });
    if (!error) {
      setShowCreate(false);
      setForm({ type: 'have', item_type: 'card', item_name: '', set_name: '', condition: 'Raw', quantity: 1, estimated_value: '', notes: '' });
      fetchListings();
    }
    setSaving(false);
  }

  async function deleteListing(id) {
    await supabase.from('listings').delete().eq('id', id);
    fetchListings();
  }

  const filtered = listings.filter(l => {
    if (filter === 'all') return true;
    if (filter === 'have') return l.type === 'have';
    if (filter === 'want') return l.type === 'want';
    if (filter === 'card') return l.item_type === 'card';
    if (filter === 'sealed') return l.item_type === 'sealed';
    return true;
  });

  const navItems = [
    { icon: '◈', label: 'Dashboard', path: '/dashboard' },
    { icon: '▣', label: 'Browse Trades', path: '/listings', active: true },
    { icon: '◎', label: 'My Trades', path: '/trades' },
    { icon: '◐', label: 'My Profile', path: `/profile/${session?.user?.id}` },
  ];

  return (
    <div className="listings-page">
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

      <main className="listings-main">
        <div className="listings-header">
          <div>
            <h1 className="listings-title">Browse Trades</h1>
            <p className="listings-sub">{filtered.length} active listings</p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Create Listing</button>
        </div>

        {/* Filters */}
        <div className="listings-filters">
          {['all', 'have', 'want', 'card', 'sealed'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="listings-loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="listings-empty">
            <p>No listings found</p>
            <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ marginTop: 16 }}>Create First Listing</button>
          </div>
        ) : (
          <div className="listings-grid">
            {filtered.map(listing => (
              <div key={listing.id} className="listing-card">
                <div className="listing-card-top">
                  <div className="listing-tags">
                    <div className={`tag ${listing.type === 'have' ? '' : 'tag-blue'}`}>
                      {listing.type === 'have' ? 'HAVE' : 'WANT'}
                    </div>
                    <div className="tag tag-gold">{listing.item_type.toUpperCase()}</div>
                  </div>
                  {listing.estimated_value && (
                    <div className="listing-value">${listing.estimated_value}</div>
                  )}
                </div>
                <div className="listing-name">{listing.item_name}</div>
                {listing.set_name && <div className="listing-set">{listing.set_name}</div>}
                <div className="listing-meta">
                  {listing.condition} · Qty {listing.quantity}
                </div>
                {listing.notes && <div className="listing-notes">{listing.notes}</div>}
                <div className="listing-footer">
                  <div className="listing-trader" onClick={() => navigate(`/profile/${listing.user_id}`)}>
                    {listing.profiles?.avatar_url
                      ? <img src={listing.profiles.avatar_url} alt="avatar" className="listing-avatar" />
                      : <div className="listing-avatar-initial">{listing.profiles?.username?.[0]?.toUpperCase() || '?'}</div>
                    }
                    <div>
                      <div className="listing-username">{listing.profiles?.username || 'Trader'}</div>
                      <div className={`listing-trust ${listing.profiles?.trust_score >= 80 ? 'trust-high' : listing.profiles?.trust_score >= 40 ? 'trust-mid' : 'trust-low'}`}>
                        Trust: {listing.profiles?.trust_score || 0}
                      </div>
                    </div>
                  </div>
                  {listing.user_id === session?.user?.id ? (
                    <button className="btn-danger" onClick={() => deleteListing(listing.id)}>Remove</button>
                  ) : (
                    <button className="btn-primary" onClick={() => navigate(`/profile/${listing.user_id}`)}>Trade</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Listing</h2>
                <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
              </div>
              <form onSubmit={createListing} className="modal-form">
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">I Have / I Want</label>
                    <select className="field-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      <option value="have">I Have (offering)</option>
                      <option value="want">I Want (looking for)</option>
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label">Item Type</label>
                    <select className="field-input" value={form.item_type} onChange={e => setForm(f => ({ ...f, item_type: e.target.value, condition: e.target.value === 'sealed' ? 'Sealed' : 'Raw' }))}>
                      <option value="card">Single Card</option>
                      <option value="sealed">Sealed Product</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Item Name *</label>
                  <input className="field-input" placeholder={form.item_type === 'card' ? 'e.g. Charizard ex' : 'e.g. Prismatic Evolutions ETB'} value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} required />
                </div>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">Set / Series</label>
                    <input className="field-input" placeholder="e.g. Prismatic Evolutions" value={form.set_name} onChange={e => setForm(f => ({ ...f, set_name: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label className="field-label">Condition</label>
                    <select className="field-input" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                      {form.item_type === 'sealed'
                        ? <option>Sealed</option>
                        : CONDITIONS.filter(c => c !== 'Sealed').map(c => <option key={c}>{c}</option>)
                      }
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">Estimated Value ($)</label>
                    <input className="field-input" type="number" step="0.01" placeholder="0.00" value={form.estimated_value} onChange={e => setForm(f => ({ ...f, estimated_value: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label className="field-label">Quantity</label>
                    <input className="field-input" type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Notes</label>
                  <input className="field-input" placeholder="Any additional details..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Listing'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
