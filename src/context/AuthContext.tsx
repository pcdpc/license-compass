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
  const [user, setUser] = useState<User | null>({ uid: 'mock-user', email: 'np@example.com', displayName: 'Larry Montgomery' } as any);
  const [userProfile, setUserProfile] = useState<UserProfile | null>({
    email: 'np@example.com',
    displayName: 'Larry Montgomery',
    photoURL: '',
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
    role: 'user',
    settings: {
      emailNotifications: true,
      reminderDays: [180, 90],
      timezone: 'America/New_York'
    },
    stats: {
      totalStates: 3,
      activeStates: 2,
      pendingStates: 1,
      readyStates: 1
    }
  } as UserProfile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Disabled for mock demo
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
