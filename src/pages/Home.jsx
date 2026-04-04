import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, UserCheck, FileText, CheckCircle, Clock, Layout } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Home.css';
import Footer from '../components/Footer';

// Firebase Imports
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, signed: 0, pending: 0 });

  // Fetch Stats Logic (Sirf tab chalega jab user login ho)
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "agreements"), where("ownerEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data());
      const total = list.length;
      const signed = list.filter(a => a.status === "filled").length;
      const pending = total - signed;
      setStats({ total, signed, pending });
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="premium-home-wrapper">
      <Navbar />
      
      {/* Animated Background Elements */}
      <div className="bg-blob blob-purple"></div>
      <div className="bg-blob blob-blue"></div>

      <main className="hero-container">
        
        {/* --- HERO SECTION (UNCHANGED) --- */}
        <header className="hero-content">
          <div className="premium-badge">Trusted by 10,000+ Owners</div>
          <h1 className="hero-title">
            Smart Tenant <br />
            <span className="gradient-text">Verification System</span>
          </h1>
          <p className="hero-subtitle">
            India's most secure digital verification platform. 
            Instant background checks, biometric validation, and paperless agreements.
          </p>
          
          <div className="hero-actions">
            <a href="/dashboard" className="btn-main">
              Get Started <ArrowRight size={20} />
            </a>
            <a href="/dashboard" className="btn-glass">Tenant Status</a>
          </div>
        </header>

        {/* --- NEW: DASHBOARD PREVIEW STRIP (ONLY FOR LOGGED IN USERS) --- */}
        {user && (
          <div className="dashboard-strip">
            <div className="strip-header">
              <span className="user-welcome">👋 Welcome back, {user.displayName || "Owner"}</span>
              <a href="/dashboard" className="goto-dash-link">Go to Full Dashboard <ArrowRight size={16} /></a>
            </div>
            
            <div className="strip-grid">
              {/* Card 1 */}
              <div className="strip-card">
                <div className="strip-icon blue-glow"><FileText size={24} /></div>
                <div className="strip-info">
                  <h4>{stats.total}</h4>
                  <p>Total Agreements</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="strip-card">
                <div className="strip-icon green-glow"><CheckCircle size={24} /></div>
                <div className="strip-info">
                  <h4>{stats.signed}</h4>
                  <p>Completed</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="strip-card">
                <div className="strip-icon orange-glow"><Clock size={24} /></div>
                <div className="strip-info">
                  <h4>{stats.pending}</h4>
                  <p>Pending Action</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- FEATURES SECTION (UNCHANGED) --- */}
        <section className="features-grid">
          <div className="feature-card">
            <ShieldCheck className="f-icon" size={32} />
            <h3>Police Verified</h3>
            <p>Direct integration with local authorities for instant checks.</p>
          </div>
          <div className="feature-card">
            <UserCheck className="f-icon" size={32} />
            <h3>Live Identity</h3>
            <p>AI-powered face match and Aadhaar validation.</p>
          </div>
          <div className="feature-card">
            <FileText className="f-icon" size={32} />
            <h3>Digital Contract</h3>
            <p>Legally binding e-agreements generated in seconds.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}