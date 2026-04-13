import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile, updatePassword } from 'firebase/auth'; // 🔥 Added Auth imports
import Navbar from '../components/Navbar';
import { Mail, Phone, MapPin, ShieldCheck, Building, CheckCircle, Clock, Edit3, User, X } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, signed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  
  // Extra Profile Data State (Phone, Address)
  const [profileData, setProfileData] = useState({ phone: "", address: "Not Provided" });

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });
  const [passForm, setPassForm] = useState({ newPassword: "" });

  const firstName = user?.displayName ? user.displayName.split(" ")[0] : (user?.email?.split("@")[0] || "User");
  const avatarUrl = user?.photoURL || `https://ui-avatars.com/api/?name=${firstName}&background=0D8ABC&color=fff&size=256&bold=true`;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // 1. Fetch Property Stats
        const q = query(collection(db, "agreements"), where("ownerUid", "==", user.uid));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => doc.data());
        
        const total = list.length;
        const signed = list.filter(a => (a.currentTenants || 0) >= (a.maxTenants || 1)).length;
        const pending = total - signed;
        
        setStats({ total, signed, pending });

        // 2. Fetch User's Extra Info (Phone, Address)
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData({ phone: data.phone || "", address: data.address || "Not Provided" });
          setEditForm({ name: user.displayName || "", phone: data.phone || "", address: data.address || "" });
        } else {
          setEditForm({ name: user.displayName || "", phone: "", address: "" });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // 🔥 Handle Profile Save 🔥
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Update Name in Auth
      if (editForm.name !== user.displayName) {
        await updateProfile(user, { displayName: editForm.name });
      }

      // Save Phone & Address in Database
      await setDoc(doc(db, "users", user.uid), {
        phone: editForm.phone,
        address: editForm.address,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setProfileData({ phone: editForm.phone, address: editForm.address });
      setIsEditModalOpen(false);
      alert("Profile Details Updated Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // 🔥 Handle Password Update 🔥
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword.length < 6) return alert("Password must be at least 6 characters.");
    
    setIsSaving(true);
    try {
      await updatePassword(user, passForm.newPassword);
      setIsPassModalOpen(false);
      setPassForm({ newPassword: "" });
      alert("Password Updated Successfully!");
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        alert("For security reasons, please log out and log back in to change your password.");
      } else {
        alert("Failed to update password: " + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return <div className="loading-screen">Loading Profile...</div>;

  return (
    <div className="profile-page-wrapper">
      <Navbar />
      
      <div className="profile-banner">
        <div className="banner-overlay"></div>
      </div>

      <main className="profile-main-content">
        <div className="profile-grid">
          
          {/* --- Left Column: User Identity Card --- */}
          <div className="profile-identity-card">
            <div className="avatar-wrapper">
              <img src={avatarUrl} alt="Owner Avatar" className="profile-avatar-large" />
              <button className="edit-avatar-btn" title="Edit Avatar">
                <Edit3 size={16} />
              </button>
            </div>
            
            <h2 className="profile-name">{user.displayName || "Property Owner"}</h2>
            <p className="profile-role">Verified Owner <ShieldCheck size={16} className="verified-icon" /></p>
            
            <div className="profile-contact-info">
              <div className="contact-row">
                <Mail size={18} className="contact-icon" />
                <span>{user.email}</span>
              </div>
              <div className="contact-row">
                <Phone size={18} className="contact-icon" />
                <span>{profileData.phone ? `+91 ${profileData.phone}` : "Add Phone Number"}</span>
              </div>
              <div className="contact-row">
                <MapPin size={18} className="contact-icon" />
                <span>{profileData.address || "Add Address"}</span>
              </div>
            </div>

            <button onClick={() => setIsEditModalOpen(true)} className="btn-outline-primary w-100">
              Edit Personal Details
            </button>
          </div>

          {/* --- Right Column: Stats & Security --- */}
          <div className="profile-details-section">
            
            <div className="section-heading">
              <h3>Property & Agreement Overview</h3>
              <p>Live summary of your registered properties and tenants.</p>
            </div>

            {loading ? (
              <p className="loading-text">Fetching details...</p>
            ) : (
              <div className="profile-stats-grid">
                <div className="p-stat-card blue-border">
                  <div className="p-stat-icon blue-bg"><Building size={24} /></div>
                  <div className="p-stat-data">
                    <h4>{stats.total}</h4>
                    <span>Total Properties</span>
                  </div>
                </div>
                
                <div className="p-stat-card green-border">
                  <div className="p-stat-icon green-bg"><CheckCircle size={24} /></div>
                  <div className="p-stat-data">
                    <h4>{stats.signed}</h4>
                    <span>Fully Verified</span>
                  </div>
                </div>

                <div className="p-stat-card orange-border">
                  <div className="p-stat-icon orange-bg"><Clock size={24} /></div>
                  <div className="p-stat-data">
                    <h4>{stats.pending}</h4>
                    <span>Pending Action</span>
                  </div>
                </div>
              </div>
            )}

            <div className="account-security-card">
              <h3>Account Security</h3>
              
              <div className="security-option">
                <div className="sec-icon-box"><User size={20} /></div>
                <div className="sec-info">
                  <h4>Account Status</h4>
                  <p>Active and fully verified. You can create agreements.</p>
                </div>
                <span className="sec-badge success">Active</span>
              </div>

              <div className="security-option">
                <div className="sec-icon-box"><ShieldCheck size={20} /></div>
                <div className="sec-info">
                  <h4>Password</h4>
                  <p>Keep your account secure with a strong password.</p>
                </div>
                <button onClick={() => setIsPassModalOpen(true)} className="btn-text">Update</button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* 🔥 Edit Profile Modal 🔥 */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="modal-body modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} placeholder="10-digit mobile number" pattern="[0-9]{10}" />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} placeholder="City, State" />
              </div>
              <button type="submit" disabled={isSaving} className="modal-btn">
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔥 Update Password Modal 🔥 */}
      {isPassModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Update Password</h3>
              <button onClick={() => setIsPassModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdatePassword} className="modal-body modal-form">
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={passForm.newPassword} onChange={(e) => setPassForm({newPassword: e.target.value})} placeholder="Enter new password" required minLength="6" />
              </div>
              <button type="submit" disabled={isSaving} className="modal-btn">
                {isSaving ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}