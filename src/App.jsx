import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Pages
import Login from "./pages/Login";
import TenantForm from "./pages/TenantForm";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import TenantPortal from "./pages/TenantPortal";
import ContractView from "./pages/ContractView";
import TenantAgreement from "./pages/TenantAgreement"; 
import AgreementDetails from "./pages/AgreementDetails";
import "./App.css";

// 🔥 NEW: Smart Component to auto-fetch agreement data and redirect
function DirectAgreementLink() {
  const { key } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const q = query(collection(db, "agreements"), where("accessKey", "==", key));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const agreementData = { id: snap.docs[0].id, ...snap.docs[0].data() };
          // Data mil gaya -> Sidha Tenant Agreement Form par bhej do!
          navigate(`/fill-agreement/${key}`, { state: { agreement: agreementData }, replace: true });
        } else {
          alert("Invalid or Expired Agreement Link!");
          navigate("/portal", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching agreement:", error);
        navigate("/portal", { replace: true });
      }
    };
    if (key) fetchAgreement();
  }, [key, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', color: '#334155', fontSize: '18px', fontWeight: 'bold' }}>
      Opening Agreement Form securely...
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Initializing SafeStay...</div>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Login />} />
        
        <Route path="/register-tenant" element={<TenantForm />} />
        <Route path="/portal" element={<TenantPortal />} />

        {/* 🔥 NEW: Route for the Share Link */}
        <Route path="/share/:key" element={<DirectAgreementLink />} />

        {/* Tenant Agreement Flow */}
        <Route path="/fill-agreement/:key" element={<TenantAgreement />} />
        <Route path="/view-contract" element={<ContractView />} />

        {/* Protected Routes (Owner Only) */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/agreement-details/:id" element={user ? <AgreementDetails /> : <Navigate to="/login" />} />  
        <Route path="/contract" element={user ? <ContractView /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}