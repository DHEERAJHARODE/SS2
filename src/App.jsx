import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import TenantForm from "./pages/TenantForm";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import TenantPortal from "./pages/TenantPortal";
import ContractView from "./pages/ContractView";
import TenantAgreement from "./pages/TenantAgreement"; 
import "./App.css";

function AppRoutes() {
  const { user, loading } = useAuth(); // Access global auth state

  if (loading) return <div className="loading-screen">Initializing SafeStay...</div>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* ✅ FIX: पहले से लॉगिन यूज़र को अब Home (/) पर भेजा जाएगा */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/" /> : <Login />} 
        />
        
        <Route path="/register-tenant" element={<TenantForm />} />
        <Route path="/portal" element={<TenantPortal />} />

        {/* Tenant Agreement Flow */}
        <Route path="/fill-agreement/:key" element={<TenantAgreement />} />
        <Route path="/view-contract" element={<ContractView />} />

        {/* Protected Routes (Owner Only) */}
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/contract" 
          element={user ? <ContractView /> : <Navigate to="/login" />} 
        />
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