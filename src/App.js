import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import Profile from './pages/Profile';
import Sets from './pages/Sets';
import Activity from './pages/Activity';
import TradeRoom from './pages/TradeRoom';
import Trades from './pages/Trades';
import './App.css';

function PrivateRoute({ children, session, loading }) {
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  return session ? children : <Navigate to="/auth" />;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing session={session} />} />
        <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/dashboard" element={<PrivateRoute session={session} loading={loading}><Dashboard session={session} /></PrivateRoute>} />
        <Route path="/listings" element={<PrivateRoute session={session} loading={loading}><Listings session={session} /></PrivateRoute>} />
        <Route path="/trades" element={<PrivateRoute session={session} loading={loading}><Trades session={session} /></PrivateRoute>} />
        <Route path="/profile/:id" element={<PrivateRoute session={session} loading={loading}><Profile session={session} /></PrivateRoute>} />
        <Route path="/sets" element={<PrivateRoute session={session} loading={loading}><Sets session={session} /></PrivateRoute>} />
        <Route path="/activity" element={<PrivateRoute session={session} loading={loading}><Activity session={session} /></PrivateRoute>} />
        <Route path="/trade/:id" element={<PrivateRoute session={session} loading={loading}><TradeRoom session={session} /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
