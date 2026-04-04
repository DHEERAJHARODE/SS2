import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase"; // Ensure this points to your unified firebase.js
import { onAuthStateChanged, signOut } from "firebase/auth"; // ✅ signOut इंपोर्ट किया

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ NEW: Logout फंक्शन बनाया
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // ✅ Exporting user, loading, AND logout
  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);