'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/types/schema';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
              status: isSuperAdmin ? 'active' : 'pending',
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
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
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
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
