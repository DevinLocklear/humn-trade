import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Listings.css';

const CONDITIONS = ['Raw', 'PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'BGS 10', 'BGS 9.5', 'BGS 9', 'CGC 10', 'CGC 9.5', 'Sealed'];

export default function Listings({ session }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('want'); // want | inventory
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [watchlist, setWatchlist] = useState(new Set());
  const [offerModal, setOfferModal] = useState(null);
  const [myInventory, setMyInventory] = useState([]);
  const [offerForm, setOfferForm] = useState({ inventory_id: '', message: '' });
  const [sendingOffer, setSendingOffer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    type: 'want', item_type: 'card', item_name: '', set_name: '',
    condition: 'Raw', quantity: 1, estimated_value: '', notes: '', accepting_offers: true,
  });

  useEffect(() => { fetchListings(); fetchWatchlist(); fetchMyInventory(); }, []); // eslint-disable-line

  async function fetchListings() {
    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select('*, profiles(username, trust_score, avatar_url, id)')
      .eq('active', true)
      .order('created_at', { ascending: false });
    setListings(data || []);
    setLoading(false);
  }

  async function fetchWatchlist() {
    const { data } = await supabase.from('watchlist').select('listing_id').eq('user_id', session.user.id);
    setWatchlist(new Set((data || []).map(w => w.listing_id)));
  }

  async function fetchMyInventory() {
    const { data } = await supabase.from('listings').select('id, item_name, estimated_value, set_name')
      .eq('user_id', session.user.id).eq('type', 'have').eq('active', true);
    setMyInventory(data || []);
  }

  async function toggleWatchlist(listingId, e) {
    e.stopPropagation();
    if (watchlist.has(listingId)) {
      await supabase.from('watchlist').delete().eq('user_id', session.user.id).eq('listing_id', listingId);
      setWatchlist(prev => { const n = new Set(prev); n.delete(listingId); return n; });
    } else {
      await supabase.from('watchlist').insert({ user_id: session.user.id, listing_id: listingId });
      setWatchlist(prev => new Set([...prev, listingId]));
    }
  }

  async function sendOffer(e) {
    e.preventDefault();
    setSendingOffer(true);
    await supabase.from('offers').insert({
      listing_id: offerModal.id,
      from_user_id: session.user.id,
      to_user_id: offerModal.user_id,
      offer_listing_id: offerForm.inventory_id || null,
      message: offerForm.message || null,
    });
    setOfferModal(null);
    setOfferForm({ inventory_id: '', message: '' });
    setSendingOffer(false);
    alert('Offer sent!');
  }

  async function createListing(e) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('listings').insert({
      user_id: session.user.id,
      type: form.type, item_type: form.item_type, item_name: form.item_name,
      set_name: form.set_name || null, condition: form.condition,
      quantity: parseInt(form.quantity) || 1,
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
      notes: form.notes || null,
      accepting_offers: form.type === 'have' ? form.accepting_offers : true,
    });
    setShowCreate(false);
    setForm({ type: 'want', item_type: 'card', item_name: '', set_name: '', condition: 'Raw', quantity: 1, estimated_value: '', notes: '', accepting_offers: true });
    fetchListings(); fetchMyInventory();
    setSaving(false);
  }

  async function deleteListing(id) {
    await supabase.from('listings').delete().eq('id', id);
    fetchListings(); fetchMyInventory();
  }

  async function toggleAcceptingOffers(listing) {
    await supabase.from('listings').update({ accepting_offers: !listing.accepting_offers }).eq('id', listing.id);
    fetchListings();
  }

  const wantListings = listings.filter(l => l.type === 'want');
  const inventoryListings = listings.filter(l => l.type === 'have');
  const displayed = tab === 'want' ? wantListings : inventoryListings;

  const navItems = [
    { icon: '◈', label: 'Dashboard', path: '/dashboard' },
    { icon: '▣', label: 'Browse Trades', path: '/listings', active: true },
    { icon: '⚡', label: 'Activity', path: '/activity' },
    { icon: '◎', label: 'My Trades', path: '/trades' },
    { icon: '🃏', label: 'Browse Sets', path: '/sets' },
    { icon: '◐', label: 'My Profile', path: `/profile/${session?.user?.id}` },
  ];

  return (
    <div className="listings-page">
      <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        <div className="sidebar-logo" onClick={() => navigate('/')}><img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN" className="sidebar-logo-img" />HUMN <span>Trade</span></div>
        <nav className="sidebar-nav">{navItems.map((item, i) => (<div key={i} className={`sidebar-item ${item.active ? 'active' : ''}`} onClick={() => navigate(item.path)}><span className="sidebar-icon">{item.icon}</span><span className="sidebar-label">{item.label}</span></div>))}</nav>
        <div className="sidebar-footer"><button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="btn-ghost" style={{ width: '100%', fontSize: 13, padding: '9px' }}>Sign Out</button></div>
      </aside>

      <main className="listings-main">
        <div className="listings-header">
          <div>
            <h1 className="listings-title">Marketplace</h1>
            <p className="listings-sub">{displayed.length} {tab === 'want' ? 'trade requests' : 'inventory items'}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={() => { setForm(f => ({...f, type: 'have'})); setShowCreate(true); }}>+ Add to Inventory</button>
            <button className="btn-primary" onClick={() => { setForm(f => ({...f, type: 'want'})); setShowCreate(true); }}>+ Post Trade Request</button>
          </div>
        </div>

        {/* Main tabs */}
        <div className="listings-tabs">
          <button className={`listings-tab ${tab === 'want' ? 'active' : ''}`} onClick={() => setTab('want')}>
            🔍 Trade Requests <span className="tab-count">{wantListings.length}</span>
          </button>
          <button className={`listings-tab ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}>
            📦 Community Inventory <span className="tab-count">{inventoryListings.length}</span>
          </button>
        </div>

        {tab === 'want' && (
          <div className="tab-description">
            These are cards and products people are actively looking to trade for. Make an offer using items from your inventory.
          </div>
        )}
        {tab === 'inventory' && (
          <div className="tab-description">
            Community members' personal collections. Items marked as accepting offers can be traded for.
          </div>
        )}

        {loading ? (
          <div className="listings-loading"><div className="spinner" /></div>
        ) : displayed.length === 0 ? (
          <div className="listings-empty">
            <p>{tab === 'want' ? 'No trade requests yet' : 'No inventory listed yet'}</p>
            <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ marginTop: 16 }}>
              {tab === 'want' ? 'Post a Trade Request' : 'Add to Inventory'}
            </button>
          </div>
        ) : (
          <div className="listings-grid">
            {displayed.map(listing => (
              <div key={listing.id} className={`listing-card ${listing.type === 'have' && !listing.accepting_offers ? 'not-accepting' : ''}`}>
                <div className="listing-card-top">
                  <div className="listing-tags">
                    {listing.item_type === 'sealed' && <div className="tag tag-gold">SEALED</div>}
                    {listing.type === 'have' && (
                      <div className={`tag ${listing.accepting_offers ? 'tag-green' : ''}`} style={!listing.accepting_offers ? { background: 'var(--bg-tertiary)', color: 'var(--text-muted)', borderColor: 'var(--border)' } : {}}>
                        {listing.accepting_offers ? 'Accepting Offers' : 'Not Accepting Offers'}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {listing.estimated_value && <div className="listing-value">${listing.estimated_value}</div>}
                    <button className={`watchlist-btn ${watchlist.has(listing.id) ? 'saved' : ''}`} onClick={(e) => toggleWatchlist(listing.id, e)}>
                      {watchlist.has(listing.id) ? '⭐' : '☆'}
                    </button>
                  </div>
                </div>

                <div className="listing-name">{listing.item_name}</div>
                {listing.set_name && <div className="listing-set">{listing.set_name}</div>}
                <div className="listing-meta">{listing.condition} · Qty {listing.quantity}</div>
                {listing.notes && <div className="listing-notes">{listing.notes}</div>}

                <div className="listing-footer">
                  <div className="listing-trader" onClick={() => navigate(`/profile/${listing.user_id}`)}>
                    {listing.profiles?.avatar_url
                      ? <img src={listing.profiles.avatar_url} alt="avatar" className="listing-avatar" />
                      : <div className="listing-avatar-initial">{listing.profiles?.username?.[0]?.toUpperCase() || '?'}</div>
                    }
                    <div>
                      <div className="listing-username">{listing.profiles?.username || 'Trader'}{(listing.profiles?.trust_score || 0) >= 80 && <span className="verified-inline">✓</span>}</div>
                      <div className={`listing-trust ${(listing.profiles?.trust_score || 0) >= 80 ? 'trust-high' : (listing.profiles?.trust_score || 0) >= 40 ? 'trust-mid' : 'trust-low'}`}>{listing.profiles?.trust_score || 0} score</div>
                    </div>
                  </div>
                  {listing.user_id === session?.user?.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {listing.type === 'have' && (
                        <button className={`btn-ghost`} style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => toggleAcceptingOffers(listing)}>
                          {listing.accepting_offers ? '🔒 Close' : '✓ Open'}
                        </button>
                      )}
                      <button className="btn-danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => deleteListing(listing.id)}>Remove</button>
                    </div>
                  ) : (listing.type === 'want' || listing.accepting_offers) ? (
                    <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => setOfferModal(listing)}>
                      Make Offer
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Not accepting</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Make Offer Modal */}
        {offerModal && (
          <div className="modal-overlay" onClick={() => setOfferModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Make an Offer</h2>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {offerModal.type === 'want' ? 'They want' : 'They have'}: {offerModal.item_name} {offerModal.estimated_value ? `· $${offerModal.estimated_value}` : ''}
                  </div>
                </div>
                <button className="modal-close" onClick={() => setOfferModal(null)}>✕</button>
              </div>
              <form onSubmit={sendOffer} className="modal-form">
                {myInventory.length > 0 ? (
                  <div className="field">
                    <label className="field-label">Offer from your inventory</label>
                    <select className="field-input" value={offerForm.inventory_id} onChange={e => setOfferForm(f => ({ ...f, inventory_id: e.target.value }))}>
                      <option value="">— Select an item to offer —</option>
                      {myInventory.map(l => (<option key={l.id} value={l.id}>{l.item_name}{l.estimated_value ? ` ($${l.estimated_value})` : ''}{l.set_name ? ` · ${l.set_name}` : ''}</option>))}
                    </select>
                  </div>
                ) : (
                  <div className="offer-no-inventory">
                    <p>You have no inventory items yet.</p>
                    <button type="button" className="btn-ghost" style={{ fontSize: 13, marginTop: 8 }} onClick={() => { setOfferModal(null); setForm(f => ({...f, type: 'have'})); setShowCreate(true); }}>+ Add to Inventory First</button>
                  </div>
                )}
                <div className="field">
                  <label className="field-label">Message</label>
                  <textarea className="field-input" rows={3} placeholder="Describe your offer or ask a question..." value={offerForm.message} onChange={e => setOfferForm(f => ({ ...f, message: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                <div className="offer-note">No fees until a trade is agreed. The other party can accept, decline, or counter.</div>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setOfferModal(null)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={sendingOffer || (!offerForm.inventory_id && !offerForm.message)}>
                    {sendingOffer ? 'Sending...' : 'Send Offer →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{form.type === 'have' ? 'Add to Inventory' : 'Post Trade Request'}</h2>
                <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
              </div>
              <div className="create-type-toggle">
                <button className={`create-type-btn ${form.type === 'want' ? 'active' : ''}`} onClick={() => setForm(f => ({...f, type: 'want'}))}>🔍 Trade Request</button>
                <button className={`create-type-btn ${form.type === 'have' ? 'active' : ''}`} onClick={() => setForm(f => ({...f, type: 'have'}))}>📦 Add to Inventory</button>
              </div>
              {form.type === 'want' && <div className="create-type-desc">Post what you're looking for. Others will offer items from their inventory.</div>}
              {form.type === 'have' && <div className="create-type-desc">Add a card or product to your inventory. Toggle offers on/off anytime.</div>}
              <form onSubmit={createListing} className="modal-form">
                <div className="field">
                  <label className="field-label">Item Type</label>
                  <select className="field-input" value={form.item_type} onChange={e => setForm(f => ({ ...f, item_type: e.target.value, condition: e.target.value === 'sealed' ? 'Sealed' : 'Raw' }))}>
                    <option value="card">Single Card</option>
                    <option value="sealed">Sealed Product</option>
                  </select>
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
                      {form.item_type === 'sealed' ? <option>Sealed</option> : CONDITIONS.filter(c => c !== 'Sealed').map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">Value ($)</label>
                    <input className="field-input" type="number" step="0.01" placeholder="0.00" value={form.estimated_value} onChange={e => setForm(f => ({ ...f, estimated_value: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label className="field-label">Quantity</label>
                    <input className="field-input" type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                  </div>
                </div>
                {form.type === 'have' && (
                  <div className="accepting-toggle" onClick={() => setForm(f => ({...f, accepting_offers: !f.accepting_offers}))}>
                    <div className={`toggle-switch-sm ${form.accepting_offers ? 'on' : ''}`}><div className="toggle-knob-sm" /></div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Accepting Offers</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Others can make trade offers on this item</div>
                    </div>
                  </div>
                )}
                <div className="field">
                  <label className="field-label">Notes</label>
                  <input className="field-input" placeholder="Condition details, what you're looking for, etc." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : form.type === 'have' ? 'Add to Inventory' : 'Post Request'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
