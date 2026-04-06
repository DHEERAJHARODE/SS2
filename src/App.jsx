import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from "react";
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

// 🔥 NEW: SMART LOADER FOR DIRECT LINKS 🔥
// यह फंक्शन डायरेक्ट लिंक से आने वाले किरायेदार का डेटा बैकग्राउंड में निकाल लेगा
function SmartTenantAgreement() {
  const { key } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!location.state?.agreement);

  useEffect(() => {
    // अगर बैकग्राउंड डेटा (state) मिसिंग है (यानी डायरेक्ट लिंक से ओपन हुआ है)
    if (!location.state?.agreement && key) {
      const fetchAgreementData = async () => {
        try {
          const q = query(collection(db, "agreements"), where("accessKey", "==", key));
          const snap = await getDocs(q);

          if (!snap.empty) {
            const agreementData = { id: snap.docs[0].id, ...snap.docs[0].data() };
            // डेटा मिलने के बाद, वापस उसी फॉर्म पर डेटा के साथ भेज दो
            navigate(`/fill-agreement/${key}`, { state: { agreement: agreementData }, replace: true });
          } else {
            alert("Invalid or Expired Agreement Link! Please enter key manually.");
            navigate("/portal", { replace: true });
          }
        } catch (error) {
          console.error("Error fetching agreement:", error);
          navigate("/portal", { replace: true });
        } finally {
          setLoading(false);
        }
      };
      fetchAgreementData();
    } else {
      setLoading(false);
    }
  }, [key, location.state, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', color: '#334155', fontSize: '18px', fontWeight: 'bold' }}>
        Loading Secure Agreement Form...
      </div>
    );
  }

  // डेटा आने के बाद ओरिजिनल फॉर्म खोल दो
  return <TenantAgreement />;
}

function AppRoutes() {
  const { user, loading } = useAuth(); // Access global auth state

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

        {/* ✅ FIX: ओरिजिनल की जगह Smart Wrapper लगा दिया गया है */}
        <Route path="/fill-agreement/:key" element={<SmartTenantAgreement />} />
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