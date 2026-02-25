"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { clientAuth } from "firebase-config/client";

const AuthContext = createContext(null);

function parseFirebaseUser(fbUser) {
  if (!fbUser) return null;

  const displayName = fbUser.displayName || "";
  const nameParts = displayName.split(" ");
  const firstName = nameParts[0] || null;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

  return {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    firstName,
    lastName,
    fullName: fbUser.displayName,
    imageUrl: fbUser.photoURL,
    photoURL: fbUser.photoURL,
  };
}

export function FirebaseAuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setUser(parseFirebaseUser(fbUser));
      setIsLoaded(true);

      if (fbUser) {
        // Create/refresh session cookie on the server
        try {
          const idToken = await fbUser.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
        } catch {
          // Session creation failed — will retry on next auth state change
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const getToken = useCallback(async () => {
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken();
    } catch {
      return null;
    }
  }, [firebaseUser]);

  const signIn = useCallback(async (email, password) => {
    const result = await signInWithEmailAndPassword(clientAuth, email, password);
    return result.user;
  }, []);

  const signUp = useCallback(async (email, password, firstName, lastName) => {
    const result = await createUserWithEmailAndPassword(clientAuth, email, password);
    const displayName = `${firstName} ${lastName}`.trim();
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      await firebaseSignOut(clientAuth);
    } catch {
      // Sign out error — silently handle
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    await sendPasswordResetEmail(clientAuth, email);
  }, []);

  const updateUserPassword = useCallback(async (currentPassword, newPassword) => {
    if (!firebaseUser) throw new Error("Not authenticated");
    // Re-authenticate first
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await reauthenticateWithCredential(firebaseUser, credential);
    // Then update password
    await firebaseUpdatePassword(firebaseUser, newPassword);
  }, [firebaseUser]);

  const value = {
    user,
    firebaseUser,
    isLoaded,
    isSignedIn: !!firebaseUser,
    getToken,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword: updateUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within FirebaseAuthProvider");
  }
  return context;
}
