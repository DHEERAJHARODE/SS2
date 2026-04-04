import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  LogOut, 
  Copy, 
  CheckCircle, 
  Clock,
  Menu, 
  X     
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [agreements, setAgreements] = useState([]);
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    propertyName: "",
    rentAmount: "",
    maxTenants: 1, 
    terms: "1. Rent must be paid by the 5th of every month.\n2. Security deposit is refundable.\n3. Keep the premises clean.", 
  });

  const firstName = user?.displayName ? user.displayName.split(" ")[0] : (user?.email?.split("@")[0] || "User");
  const avatarUrl = `https://ui-avatars.com/api/?name=${firstName}&background=0D8ABC&color=fff&size=128&bold=true`;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "agreements"), where("ownerUid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAgreements(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleCreateAgreement = async (e) => {
    e.preventDefault();
    if (!formData.propertyName || !formData.rentAmount) return alert("Please fill details");

    try {
      const accessKey = Math.random().toString(36).substring(2, 10).toUpperCase();
      await addDoc(collection(db, "agreements"), {
        ...formData,
        maxTenants: parseInt(formData.maxTenants) || 1,
        currentTenants: 0, 
        accessKey,
        ownerUid: user.uid,
        status: "pending",
        createdAt: new Date().toISOString(),
        tenantSignature: null
      });
      alert("Agreement Created! Share the Access Key.");
      setActiveTab("agreements");
      setFormData({ propertyName: "", rentAmount: "", maxTenants: 1, terms: formData.terms });
    } catch (err) {
      console.error(err);
      alert("Error creating agreement");
    }
  };

  // ✅ 1. Existing function for Full Link
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(`${window.location.origin}/portal`);
    alert("Tenant Portal Link Copied! Share this key: " + text);
  };

  // ✅ 2. NEW function to copy ONLY the Access Key
  const copyKeyOnly = (keyText) => {
    navigator.clipboard.writeText(keyText);
    alert(`Access Key Copied: ${keyText}`);
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* Mobile Header Bar */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <span className="mobile-brand">SafeStay.</span>
        <img src={avatarUrl} alt="User" className="mobile-avatar" />
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <h2>SafeStay<span className="dot">.</span></h2>
          </div>
          <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="user-profile-mini">
          <img src={avatarUrl} alt="Profile" />
          <div>
            <h4>{firstName}</h4>
            <span className="role-badge">Owner</span>
          </div>
        </div>

        <nav className="nav-menu">
          <button 
            className={activeTab === "overview" ? "active" : ""} 
            onClick={() => handleNavClick("overview")}
          >
            <LayoutDashboard size={20} /> Overview
          </button>
          <button 
            className={activeTab === "create" ? "active" : ""} 
            onClick={() => handleNavClick("create")}
          >
            <PlusCircle size={20} /> Create Agreement
          </button>
          <button 
            className={activeTab === "agreements" ? "active" : ""} 
            onClick={() => handleNavClick("agreements")}
          >
            <FileText size={20} /> My Agreements
          </button>
        </nav>

        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-header desktop-only">
          <h1>
            {activeTab === "overview" && "Dashboard Overview"}
            {activeTab === "create" && "New Agreement"}
            {activeTab === "agreements" && "Manage Agreements"}
          </h1>
          <div className="date-badge">{new Date().toDateString()}</div>
        </header>

        <div className="mobile-page-title">
          <h2>
             {activeTab === "overview" && "Overview"}
             {activeTab === "create" && "New Agreement"}
             {activeTab === "agreements" && "Agreements"}
          </h2>
        </div>

        <div className="content-area">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="stats-grid">
              <div className="stat-card" onClick={() => handleNavClick("agreements")}>
                <div className="icon-box blue"><FileText size={24}/></div>
                <div>
                  <h3>{agreements.length}</h3>
                  <p>Total Agreements</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="icon-box green"><CheckCircle size={24}/></div>
                <div>
                  <h3>{agreements.filter(a => a.status === 'filled').length}</h3>
                  <p>Fully Signed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="icon-box orange"><Clock size={24}/></div>
                <div>
                  <h3>{agreements.filter(a => a.status === 'pending').length}</h3>
                  <p>Pending</p>
                </div>
              </div>
            </div>
          )}

          {/* CREATE AGREEMENT TAB */}
          {activeTab === "create" && (
            <div className="form-card">
              <h2>Create Rental Agreement</h2>
              <form onSubmit={handleCreateAgreement}>
                <div className="form-group">
                  <label>Property Name / Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Flat 101, Galaxy Apartment" 
                    value={formData.propertyName}
                    onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Monthly Rent (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 12000" 
                    value={formData.rentAmount}
                    onChange={(e) => setFormData({...formData, rentAmount: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Number of Tenants (How many people will sign?)</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="e.g. 2" 
                    value={formData.maxTenants}
                    onChange={(e) => setFormData({...formData, maxTenants: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Terms & Conditions</label>
                  <textarea 
                    rows="5"
                    value={formData.terms}
                    onChange={(e) => setFormData({...formData, terms: e.target.value})}
                  ></textarea>
                </div>
                <button type="submit" className="primary-btn">Generate Agreement</button>
              </form>
            </div>
          )}

          {/* MY AGREEMENTS TAB */}
          {activeTab === "agreements" && (
            <div className="table-container">
              {agreements.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} color="#cbd5e1"/>
                  <p>No agreements found. Create one to get started.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="agreements-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Access Key</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agreements.map((ag) => (
                        <tr key={ag.id}>
                          <td>{ag.propertyName}</td>
                          <td>{new Date(ag.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${ag.status === 'filled' ? 'success' : 'pending'}`}>
                              {ag.currentTenants || 0} Signed
                            </span>
                          </td>

                          {/* ✅ 3. NEW: Access Key Box with embedded Copy Button */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="key-text" style={{ margin: 0 }}>{ag.accessKey}</span>
                              <button 
                                onClick={() => copyKeyOnly(ag.accessKey)}
                                title="Copy Access Key"
                                style={{
                                  background: '#e0e7ff',
                                  color: '#4338ca',
                                  border: 'none',
                                  padding: '6px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: '0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#c7d2fe'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#e0e7ff'}
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </td>

                          <td>
                            <button onClick={() => copyToClipboard(ag.accessKey)} className="action-btn">
                              <Copy size={16} /> <span className="btn-text">Portal Link</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}