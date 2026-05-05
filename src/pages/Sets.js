import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import './Sets.css';

export default function Sets({ session }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSetId = searchParams.get('set');

  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [loadingSets, setLoadingSets] = useState(true);
  const [loadingListings, setLoadingListings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [filterItemType, setFilterItemType] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  useEffect(() => { fetchSets(); }, []);
  useEffect(() => {
    if (selectedSetId && sets.length > 0) {
      const set = sets.find(s => s.id === selectedSetId);
      if (set) handleSelectSet(set);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSetId, sets]);

  async function fetchSets() {
    setLoadingSets(true);
    try {
      const res = await fetch('https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&pageSize=40');
      const data = await res.json();
      setSets(data?.data || []);
    } catch (e) {}
    setLoadingSets(false);
  }

  async function handleSelectSet(set) {
    setSelectedSet(set);
    setSearchParams({ set: set.id });
    setLoadingListings(true);
    // fetch all active listings
    const { data } = await supabase
      .from('listings')
      .select('*, profiles(username, trust_score, avatar_url)')
      .eq('active', true)
      .ilike('set_name', `%${set.name}%`)
      .order('created_at', { ascending: false });
    setAllListings(data || []);
      setLoadingListings(false);
  }

  function clearSet() {
    setSelectedSet(null);
    setAllListings([]);
    setSetListings([]);
    setSearchParams({});
  }

  const filteredListings = allListings.filter(l => {
    if (filterType !== 'all' && l.type !== filterType) return false;
    if (filterCondition !== 'all' && l.condition !== filterCondition) return false;
    if (filterItemType !== 'all' && l.item_type !== filterItemType) return false;
    if (priceMin && l.estimated_value < parseFloat(priceMin)) return false;
    if (priceMax && l.estimated_value > parseFloat(priceMax)) return false;
    if (searchQuery && !l.item_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredSets = sets.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgPrice = allListings.length
    ? (allListings.filter(l => l.estimated_value).reduce((a, l) => a + (l.estimated_value || 0), 0) / allListings.filter(l => l.estimated_value).length).toFixed(2)
    : null;

  const navItems = [
    { icon: '◈', label: 'Dashboard', path: '/dashboard' },
    { icon: '▣', label: 'Browse Trades', path: '/listings' },
    { icon: '◎', label: 'My Trades', path: '/trades' },
    { icon: '🃏', label: 'Browse Sets', path: '/sets', active: true },
    { icon: '◐', label: 'My Profile', path: `/profile/${session?.user?.id}` },
  ];

  return (
    <div className="sets-page">
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

      <main className="sets-main">
        {!selectedSet ? (
          /* Browse sets grid */
          <>
            <div className="sets-browse-header">
              <div>
                <h1 className="sets-browse-title">Browse Sets</h1>
                <p className="sets-browse-sub">Select a set to see all available trade listings</p>
              </div>
              <div className="sets-search-wrap">
                <span className="sets-search-icon">🔍</span>
                <input
                  className="sets-search-input"
                  placeholder="Search sets..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loadingSets ? (
              <div className="sets-loading"><div className="spinner" /></div>
            ) : (
              <div className="sets-grid">
                {filteredSets.map(set => (
                  <div key={set.id} className="set-card" onClick={() => handleSelectSet(set)}>
                    <div className="set-card-banner">
                      <img src={set.images?.logo} alt={set.name} className="set-card-logo" />
                    </div>
                    <div className="set-card-body">
                      <div className="set-card-symbol-wrap">
                        <img src={set.images?.symbol} alt="" className="set-card-symbol" />
                      </div>
                      <div className="set-card-name">{set.name}</div>
                      <div className="set-card-meta">
                        {set.series} · {set.total} cards · {new Date(set.releaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Set detail page — OpenSea collection style */
          <div className="set-detail">
            {/* Banner */}
            <div className="set-detail-banner">
              <button className="set-back-btn" onClick={clearSet}>← All Sets</button>
              <div className="set-detail-banner-bg" style={{ background: `linear-gradient(135deg, #5b5bd620, #5b5bd608)` }} />
              <div className="set-detail-banner-content">
                <img src={selectedSet.images?.logo} alt={selectedSet.name} className="set-detail-logo" />
                <div>
                  <div className="set-detail-series">{selectedSet.series}</div>
                  <h1 className="set-detail-name">{selectedSet.name}</h1>
                  <div className="set-detail-release">
                    Released {new Date(selectedSet.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {selectedSet.total} cards
                  </div>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="set-stats-bar">
              {[
                ['Total Listings', allListings.length],
                ['Have', allListings.filter(l => l.type === 'have').length],
                ['Want', allListings.filter(l => l.type === 'want').length],
                ['Avg Price', avgPrice ? `$${avgPrice}` : '—'],
                ['Cards in Set', selectedSet.total],
              ].map(([label, val]) => (
                <div key={label} className="set-stat">
                  <div className="set-stat-val">{val}</div>
                  <div className="set-stat-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Content: filters + grid */}
            <div className="set-content">
              {/* Filter panel */}
              <div className="set-filters">
                <div className="set-filter-section">
                  <div className="set-filter-label">Search cards</div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13 }}>🔍</span>
                    <input
                      className="field-input"
                      style={{ paddingLeft: 32, fontSize: 13 }}
                      placeholder="e.g. Charizard"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="set-filter-section">
                  <div className="set-filter-label">Listing Type</div>
                  <div className="set-filter-pills">
                    {['all', 'have', 'want'].map(f => (
                      <button key={f} className={`set-filter-pill ${filterType === f ? 'active' : ''}`} onClick={() => setFilterType(f)}>
                        {f === 'all' ? 'All' : f === 'have' ? 'Have' : 'Want'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="set-filter-section">
                  <div className="set-filter-label">Item Type</div>
                  <div className="set-filter-pills">
                    {['all', 'card', 'sealed'].map(f => (
                      <button key={f} className={`set-filter-pill ${filterItemType === f ? 'active' : ''}`} onClick={() => setFilterItemType(f)}>
                        {f === 'all' ? 'All' : f === 'card' ? 'Singles' : 'Sealed'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="set-filter-section">
                  <div className="set-filter-label">Condition</div>
                  <select className="field-input" style={{ fontSize: 13 }} value={filterCondition} onChange={e => setFilterCondition(e.target.value)}>
                    <option value="all">All conditions</option>
                    {['Raw', 'PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'BGS 10', 'BGS 9.5', 'BGS 9', 'CGC 10', 'CGC 9.5', 'Sealed'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="set-filter-section">
                  <div className="set-filter-label">Price Range</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="field-input" style={{ fontSize: 13 }} placeholder="Min $" type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
                    <input className="field-input" style={{ fontSize: 13 }} placeholder="Max $" type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
                  </div>
                </div>

                <button className="btn-ghost" style={{ width: '100%', fontSize: 13, padding: '9px' }}
                  onClick={() => { setFilterType('all'); setFilterCondition('all'); setFilterItemType('all'); setPriceMin(''); setPriceMax(''); setSearchQuery(''); }}>
                  Clear Filters
                </button>
              </div>

              {/* Listings grid */}
              <div className="set-listings">
                <div className="set-listings-header">
                  <span className="set-listings-count">{filteredListings.length} listings</span>
                  <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => navigate('/listings')}>
                    + Create Listing
                  </button>
                </div>

                {loadingListings ? (
                  <div className="sets-loading"><div className="spinner" /></div>
                ) : filteredListings.length === 0 ? (
                  <div className="set-empty">
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🃏</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>No listings for this set yet</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Be the first to list a card from {selectedSet.name}</div>
                    <button className="btn-primary" onClick={() => navigate('/listings')}>Create a Listing</button>
                  </div>
                ) : (
                  <div className="set-listings-grid">
                    {filteredListings.map(listing => (
                      <div key={listing.id} className="set-listing-card">
                        <div className="set-listing-top">
                          <div className="set-listing-tags">
                            <div className={`tag ${listing.type === 'have' ? '' : 'tag-blue'}`}>{listing.type === 'have' ? 'HAVE' : 'WANT'}</div>
                            {listing.item_type === 'sealed' && <div className="tag tag-gold">SEALED</div>}
                          </div>
                          {listing.estimated_value && (
                            <div className="set-listing-val">${listing.estimated_value}</div>
                          )}
                        </div>
                        <div className="set-listing-name">{listing.item_name}</div>
                        <div className="set-listing-condition">{listing.condition} {listing.quantity > 1 ? `· Qty ${listing.quantity}` : ''}</div>
                        {listing.notes && <div className="set-listing-notes">{listing.notes}</div>}
                        <div className="set-listing-footer">
                          <div className="set-listing-trader" onClick={() => navigate(`/profile/${listing.user_id}`)}>
                            {listing.profiles?.avatar_url
                              ? <img src={listing.profiles.avatar_url} alt="" className="listing-avatar" />
                              : <div className="listing-avatar-initial">{listing.profiles?.username?.[0]?.toUpperCase() || '?'}</div>
                            }
                            <div>
                              <div className="set-listing-username">{listing.profiles?.username || 'Trader'}</div>
                              <div className={`set-listing-trust ${listing.profiles?.trust_score >= 80 ? 'trust-high' : listing.profiles?.trust_score >= 40 ? 'trust-mid' : 'trust-low'}`}>
                                ⭐ {listing.profiles?.trust_score || 0}
                              </div>
                            </div>
                          </div>
                          {listing.user_id !== session?.user?.id && (
                            <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => navigate(`/profile/${listing.user_id}`)}>
                              Trade
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
