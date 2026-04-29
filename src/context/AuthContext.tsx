'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/types/schema';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isSigningIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  isSigningIn: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Check if profile exists
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            let data = profileDoc.data() as UserProfile;
            
            // Bootstrap Super Admin
            if (firebaseUser.email === 'larry.a.montgomery@gmail.com') {
              if (data.role !== 'admin' || data.status !== 'active') {
                data = { ...data, role: 'admin', status: 'active' };
                await setDoc(doc(db, 'users', firebaseUser.uid), data, { merge: true });
              }
            }
            
            setUserProfile(data);
          } else {
            // First time login - create default profile
            const isSuperAdmin = firebaseUser.email === 'larry.a.montgomery@gmail.com';
            
            const newProfile: UserProfile = {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'New User',
              photoURL: firebaseUser.photoURL || '',
              createdAt: serverTimestamp() as any,
              updatedAt: serverTimestamp() as any,
              role: isSuperAdmin ? 'admin' : 'user',
              status: 'active', // Default to active for immediate access
              settings: {
                emailNotifications: true,
                notificationsEnabled: true,
                alertSettings: {
                  license180: true,
                  license90: true,
                  license60: true,
                  license30: true,
                  license7: true,
                  deaExpiration: true,
                  missingDocuments: true,
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
              },
              stats: {
                totalStates: 0,
                activeStates: 0,
                pendingStates: 0,
                readyStates: 0,
              },
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error('Error signing in with Google', error);
      }
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Error signing in with Email', error);
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, pass);
      // Wait for onAuthStateChanged to handle profile creation, 
      // but we might want to update displayName immediately
      // Actually, our onAuthStateChanged logic already creates a profile if it doesn't exist.
      // We can update the profile later if needed, but for now this is clean.
    } catch (error) {
      console.error('Error signing up with Email', error);
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, isSigningIn }}>
      {children}
    </AuthContext.Provider>
  );
};
