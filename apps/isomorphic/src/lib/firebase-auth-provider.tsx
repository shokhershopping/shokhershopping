'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUser,
} from 'firebase/auth';
import { clientAuth } from 'firebase-config/client';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: {
    displayName?: string;
    photoURL?: string;
  }) => Promise<void>;
  updateUserPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseFirebaseUser(fbUser: FirebaseUser | null): AuthUser | null {
  if (!fbUser) return null;

  const displayName = fbUser.displayName || '';
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0] || null;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

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

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (fbUser: FirebaseUser | null) => {
      setFirebaseUser(fbUser);
      setUser(parseFirebaseUser(fbUser));
      setIsLoaded(true);

      if (fbUser) {
        // Create/refresh session cookie on the server
        try {
          const idToken = await fbUser.getIdToken();
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
        } catch (error) {
          console.error('Failed to create session:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken();
    } catch {
      return null;
    }
  }, [firebaseUser]);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      await firebaseSignOut(clientAuth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const updateUserProfile = useCallback(
    async (data: { displayName?: string; photoURL?: string }) => {
      if (!firebaseUser) throw new Error('No user signed in');
      await updateProfile(firebaseUser, data);
      setUser(parseFirebaseUser(firebaseUser));
    },
    [firebaseUser]
  );

  const updateUserPassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('No user signed in');
      }
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(firebaseUser, credential);
      await firebaseUpdatePassword(firebaseUser, newPassword);
    },
    [firebaseUser]
  );

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoaded,
    isSignedIn: !!firebaseUser,
    getToken,
    signOut,
    updateUserProfile,
    updateUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook replacing Clerk's useAuth() + useUser() + useClerk()
 */
export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
}
