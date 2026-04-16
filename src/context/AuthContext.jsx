import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase"; // Ensure this points to your unified firebase.js
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // ✅ Firestore imports

const AuthContext = createContext();
const db = getFirestore(); // ✅ Firestore initialize kiya

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false); // ✅ Premium status check state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // ✅ Firestore se user ka premium status fetch karna
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setIsPremium(userData.isPremium || false); // True ya False set hoga
          } else {
            setIsPremium(false);
          }
        } catch (error) {
          console.error("Error fetching premium status:", error);
          setIsPremium(false);
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setIsPremium(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Logout Function
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // ✅ Exporting user, loading, logout, AND isPremium
  return (
    <AuthContext.Provider value={{ user, loading, logout, isPremium }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);