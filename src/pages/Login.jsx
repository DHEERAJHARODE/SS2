import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from "../firebase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, ArrowLeft, Lock, Mail, Key, Loader2, User } from "lucide-react";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setIsSignUp(location.pathname === '/signup');
    setError('');
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        console.log("Registered:", userCredential.user);
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
      // ✅ FIX: Dashboard की जगह Home (/) पर रीडायरेक्ट किया
      navigate("/");
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // ✅ FIX: Google Login के बाद भी Home (/) पर रीडायरेक्ट किया
      navigate("/");
    } catch (error) {
      setError("Google Login Failed");
    }
  };

  const handleResetPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email first to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, formData.email);
      alert("Password reset link sent to your email!");
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleMode = () => {
    if (isSignUp) navigate('/login');
    else navigate('/signup');
  };

  return (
    <div className="login-wrapper">
      <div className="login-blob blob-purple"></div>
      <div className="login-blob blob-blue"></div>

      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="login-glass-card">
        <div className="login-header">
          <div className="icon-wrapper">
            <Shield size={36} className="brand-icon" />
          </div>
          <h1>{isSignUp ? "Create Account" : "Welcome Back"}</h1>
          <p className="login-subtitle">
            {isSignUp ? "Start managing your properties with" : "Secure access for"}{" "}
            <span className="highlight">SafeStay</span>
          </p>
        </div>

        <div className="login-body">
          <form onSubmit={handleAuth} className="auth-form">
            
            {isSignUp && (
              <div className="input-group slide-in">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Full Name" 
                  className="premium-input"
                  value={formData.fullName}
                  onChange={handleChange}
                  required={isSignUp}
                />
              </div>
            )}

            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                name="email"
                placeholder="Email Address" 
                className="premium-input"
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="input-group">
              <Key size={18} className="input-icon" />
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                className="premium-input"
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>

            {error && <p className="error-msg">{error}</p>}

            {!isSignUp && (
              <div className="forgot-pass" onClick={handleResetPassword}>
                Forgot Password?
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="spin" size={20}/> : (isSignUp ? "Create Account" : "Log In")}
            </button>
          </form>

          <div className="divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <button className="google-btn-premium" onClick={handleGoogleLogin}>
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
            />
            <span>Google</span>
          </button>

          <div className="toggle-container">
            <p>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <span className="toggle-link" onClick={toggleMode}>
                {isSignUp ? " Log In" : " Sign Up"}
              </span>
            </p>
          </div>
        </div>

        <div className="login-footer">
          <Lock size={14} />
          <span>Encrypted & Secure Connection</span>
        </div>
      </div>
    </div>
  );
}