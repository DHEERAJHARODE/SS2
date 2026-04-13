import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  LogIn, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Phone, 
  Settings, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Assuming logout comes from context
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMobileOpen(!isMobileOpen);
  
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      if (logout) await logout();
      navigate('/login');
      setIsMobileOpen(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Generate Avatar URL (Consistent with Dashboard)
  const firstName = user?.displayName ? user.displayName.split(" ")[0] : (user?.email?.split("@")[0] || "U");
  const avatarUrl = user?.photoURL || `https://ui-avatars.com/api/?name=${firstName}&background=3b82f6&color=fff&size=128&bold=true`;

  return (
    <nav className="premium-nav">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo" onClick={() => handleNavigation('/')}>
          <Shield className="logo-icon" size={28} />
          <span className="logo-text">SafeStay</span>
        </div>
        
        {/* 🔥 NEW: Mobile Overlay for Premium Look 🔥 */}
        {isMobileOpen && <div className="nav-overlay" onClick={toggleMenu}></div>}

        {/* Desktop & Mobile Menu Links */}
        <div className={`nav-links ${isMobileOpen ? 'active' : ''}`}>
          <button onClick={() => handleNavigation('/portal')} className="nav-item">
            Tenant Portal
          </button>
          
          {user ? (
            <div className="profile-wrapper" ref={dropdownRef}>
              {/* Profile Trigger Button */}
              <button 
                className="profile-trigger" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img src={avatarUrl} alt="User" className="nav-avatar" />
                <span className="nav-username">{firstName}</span>
                <ChevronDown size={16} className={`chevron ${isDropdownOpen ? 'rotate' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dd-name">{user.displayName || "User"}</p>
                    <p className="dd-email">{user.email}</p>
                  </div>
                  
                  <button onClick={() => handleNavigation('/dashboard')} className="dropdown-item">
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                  
                  <button onClick={() => handleNavigation('/profile')} className="dropdown-item">
                    <User size={16} /> My Profile
                  </button>

                  <button onClick={() => handleNavigation('/contact')} className="dropdown-item">
                    <Phone size={16} /> Contact Us
                  </button>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button onClick={handleLogout} className="dropdown-item danger">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => handleNavigation('/login')} className="nav-pill">
              <LogIn size={18} />
              Owner Login
            </button>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button className="mobile-toggle" onClick={toggleMenu}>
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}