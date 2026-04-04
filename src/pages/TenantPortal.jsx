import React, { useState, useRef } from 'react';
import { db } from '../firebase'; // Path match
// ✅ NEW: Added 'increment' to the import list
import { getDocs, query, collection, where, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Camera, ShieldCheck, Upload, User, FileText, MapPin, Phone, CreditCard } from 'lucide-react';

const TenantPortal = () => {
  const navigate = useNavigate();
  
  // State for Manual Key Entry
  const [key, setKey] = useState('');
  const [agreement, setAgreement] = useState(null);
  const [fetching, setFetching] = useState(false);

  // Camera Refs & State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Full Form State
  const [tenantData, setTenantData] = useState({
    name: "",
    fatherName: "",
    address: "",
    mobile: "",
    aadhaar: "",
    aadhaarFront: "", 
    aadhaarBack: "",  
    pan: "",
    panCard: "",      
    signature: "",    
    selfie: ""        
  });

  // 1. Fetch Agreement by Key
  const fetchByKey = async () => {
    if(!key) return alert("Please enter a key!");
    setFetching(true);

    try {
        const finalKey = key.trim().toUpperCase();
        const q = query(
            collection(db, "agreements"), 
            where("accessKey", "==", finalKey)
        );
        
        const snap = await getDocs(q);
        if (!snap.empty) {
            const data = snap.docs[0].data();
            
            // ✅ NEW: Check if current signatures reached the max limit
            const current = data.currentTenants || 0;
            const max = data.maxTenants || 1;

            if(current >= max) {
                alert(`⛔ This agreement is already fully signed by all ${max} tenants.`);
                setAgreement(null);
            } else {
                setAgreement({ id: snap.docs[0].id, ...data });
            }
        } else {
            alert("❌ Invalid Key! Please check with the owner.");
        }
    } catch (error) {
        console.error("Error fetching:", error);
        alert("Network Error.");
    } finally {
        setFetching(false);
    }
  };

  // 2. Handle Text Inputs
  const handleInput = (e) => {
    setTenantData({ ...tenantData, [e.target.name]: e.target.value });
  };

  // Helper Function to Compress Uploaded Images to stay under 1MB limit
  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800;
            let scaleSize = 1;
            
            if (img.width > MAX_WIDTH) {
                scaleSize = MAX_WIDTH / img.width;
            }
            
            canvas.width = img.width * scaleSize;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
            callback(compressedBase64);
        };
    };
  };

  // 3. Handle File Uploads (With Compression)
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setTenantData((prev) => ({ ...prev, [field]: compressedBase64 }));
      });
    }
  };

  // 4. Camera Logic
  const startCamera = async () => {
    setShowCamera(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
        alert("Camera access denied!");
        setShowCamera(false);
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 320, 240);
    
    const imageSrc = canvas.toDataURL("image/jpeg", 0.7);
    
    setTenantData(prev => ({ ...prev, selfie: imageSrc }));
    
    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    setShowCamera(false);
  };

  // 5. Submit Full Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Validation
    if (!tenantData.aadhaarFront || !tenantData.aadhaarBack || !tenantData.panCard || !tenantData.signature || !tenantData.selfie) {
      alert("⚠️ Please upload all required photos and take a selfie.");
      return;
    }

    setSubmitting(true);

    try {
      // Step A: Save Tenant Data
      const tenantRef = await addDoc(collection(db, "tenants"), {
        ...tenantData,
        agreementId: agreement.id,
        filledAt: new Date().toISOString()
      });

      // ✅ NEW: Increment tenant count and update status ONLY IF fully filled
      const currentCount = (agreement.currentTenants || 0) + 1;
      const maxAllowed = agreement.maxTenants || 1;

      await updateDoc(doc(db, "agreements", agreement.id), {
        currentTenants: increment(1),
        status: currentCount >= maxAllowed ? "filled" : "pending"
      });

      alert("✅ Agreement Signed Successfully!");
      navigate("/view-contract", { state: { agreement: agreement, tenant: tenantData } });

    } catch (err) {
      console.error(err);
      alert("Error submitting form. The images might still be too large.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
        
        {/* STATE 1: ENTER KEY */}
        {!agreement ? (
          <div className="text-center py-10">
            <ShieldCheck size={80} className="mx-auto text-blue-600 mb-6" />
            <h1 className="text-3xl font-bold mb-2 text-slate-800">Secure Rental Agreement</h1>
            <p className="text-slate-500 mb-8">Enter the 8-character access key provided by the owner.</p>
            
            <div className="max-w-xs mx-auto space-y-4">
                <input 
                  className="w-full border-2 border-slate-200 p-4 rounded-2xl text-center text-3xl font-mono uppercase tracking-widest focus:border-blue-500 outline-none transition-colors" 
                  maxLength={8} 
                  placeholder="XXXXXXXX" 
                  onChange={e => setKey(e.target.value)} 
                />
                <button 
                  onClick={fetchByKey} 
                  disabled={fetching}
                  className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-70"
                >
                  {fetching ? "Verifying..." : "Verify & Start"}
                </button>
            </div>
          </div>
        ) : (
          /* STATE 2: FILL FORM (FULL) */
          <div className="space-y-8">
            
            {/* Agreement Info Header */}
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-1 flex items-center gap-2">
                <ShieldCheck size={20}/> Property: {agreement.propertyName}
              </h2>
              <p className="text-blue-700 font-medium">Monthly Rent: ₹{agreement.rentAmount}</p>
              <p className="text-blue-700 font-medium text-sm mt-1">
                <strong>Signatures Required:</strong> {(agreement.currentTenants || 0)} / {agreement.maxTenants || 1} Signed
              </p>
              
              <div className="mt-4 bg-white p-4 rounded-xl text-sm text-slate-600 max-h-40 overflow-y-auto">
                <p className="font-bold mb-2">Terms & Conditions:</p>
                {agreement.terms && Array.isArray(agreement.terms) ? (
                    <ul className="list-disc ml-4 space-y-1">
                        {agreement.terms.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{agreement.terms || 'No terms provided.'}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Tenant Details</h3>

                {/* Name & Father Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                        <div className="flex items-center border rounded-xl px-3 py-3 bg-slate-50">
                            <User size={18} className="text-slate-400 mr-2"/>
                            <input name="name" className="bg-transparent w-full outline-none" placeholder="As per Aadhaar" required onChange={handleInput} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Father's Name *</label>
                        <div className="flex items-center border rounded-xl px-3 py-3 bg-slate-50">
                            <User size={18} className="text-slate-400 mr-2"/>
                            <input name="fatherName" className="bg-transparent w-full outline-none" required onChange={handleInput} />
                        </div>
                    </div>
                </div>

                {/* Address & Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Permanent Address *</label>
                        <div className="flex items-start border rounded-xl px-3 py-3 bg-slate-50">
                            <MapPin size={18} className="text-slate-400 mr-2 mt-1"/>
                            <textarea name="address" rows="2" className="bg-transparent w-full outline-none resize-none" required onChange={handleInput}></textarea>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile Number *</label>
                        <div className="flex items-center border rounded-xl px-3 py-3 bg-slate-50">
                            <Phone size={18} className="text-slate-400 mr-2"/>
                            <input name="mobile" type="tel" maxLength={10} className="bg-transparent w-full outline-none" required onChange={handleInput} />
                        </div>
                    </div>
                </div>

                {/* ID Proofs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Aadhaar */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Aadhaar Details *</label>
                        <input name="aadhaar" placeholder="Aadhaar Number (12 Digits)" maxLength={12} className="w-full border p-3 rounded-xl" required onChange={handleInput} />
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div className="border border-dashed border-slate-300 p-4 rounded-xl text-center cursor-pointer hover:bg-slate-50">
                                <span className="text-xs font-bold text-slate-500">Front Photo</span>
                                <input type="file" accept="image/*" className="w-full text-xs mt-2" onChange={(e)=>handleFileUpload(e, 'aadhaarFront')} required />
                            </div>
                            <div className="border border-dashed border-slate-300 p-4 rounded-xl text-center cursor-pointer hover:bg-slate-50">
                                <span className="text-xs font-bold text-slate-500">Back Photo</span>
                                <input type="file" accept="image/*" className="w-full text-xs mt-2" onChange={(e)=>handleFileUpload(e, 'aadhaarBack')} required />
                            </div>
                        </div>
                    </div>

                    {/* PAN */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">PAN Details *</label>
                        <div className="flex items-center border rounded-xl px-3 py-3 bg-slate-50">
                            <CreditCard size={18} className="text-slate-400 mr-2"/>
                            <input name="pan" placeholder="PAN Number" maxLength={10} className="bg-transparent w-full outline-none uppercase" required onChange={handleInput} />
                        </div>
                        <div className="border border-dashed border-slate-300 p-4 rounded-xl text-center hover:bg-slate-50">
                             <span className="text-xs font-bold text-slate-500">Upload PAN Card Photo</span>
                             <input type="file" accept="image/*" className="w-full text-xs mt-2" onChange={(e)=>handleFileUpload(e, 'panCard')} required />
                        </div>
                    </div>
                </div>

                {/* Signature & Selfie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="border p-4 rounded-xl bg-slate-50">
                        <label className="block text-sm font-bold mb-2">Signature Upload *</label>
                        <input type="file" accept="image/*" onChange={(e)=>handleFileUpload(e, 'signature')} required />
                        {tenantData.signature && <img src={tenantData.signature} className="h-16 mt-2 border rounded" alt="Sign"/>}
                    </div>

                    <div className="border p-4 rounded-xl bg-slate-50 text-center">
                        <label className="block text-sm font-bold mb-2">Live Selfie *</label>
                        {showCamera ? (
                            <div className="relative">
                                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg mb-2 bg-black h-40 object-cover"></video>
                                <button type="button" onClick={captureImage} className="bg-red-500 text-white px-4 py-1 rounded-full text-sm">Capture</button>
                            </div>
                        ) : (
                            !tenantData.selfie ? (
                                <button type="button" onClick={startCamera} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 mx-auto">
                                    <Camera size={16}/> Start Camera
                                </button>
                            ) : (
                                <div className="relative">
                                    <img src={tenantData.selfie} className="w-full h-40 object-cover rounded-lg" alt="Selfie" />
                                    <button type="button" onClick={()=>setTenantData({...tenantData, selfie: ''})} className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded">Retake</button>
                                </div>
                            )
                        )}
                        <canvas ref={canvasRef} className="hidden" width="320" height="240"></canvas>
                    </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200">
                    {submitting ? "Processing Agreement..." : "Sign & Generate Agreement"}
                </button>

            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantPortal;