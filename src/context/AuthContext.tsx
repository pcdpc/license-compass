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
import { sendPasswordResetEmail as firebaseSendPasswordResetEmail, sendEmailVerification as firebaseSendEmailVerification } from 'firebase/auth';
import { toDate } from '@/lib/firestore';

const triggerOnboardingEmail = async (user: User) => {
  try {
    const token = await user.getIdToken();
    fetch('/api/emails/onboarding', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).catch(e => console.error('Failed to trigger onboarding email:', e));
  } catch (error) {
    console.error('Failed to get token for onboarding email:', error);
  }
};

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
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
  sendPasswordReset: async () => {},
  sendVerificationEmail: async () => {},
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
            
            // Bootstrap Admins - designate super admins
            const isAdmin = firebaseUser.email === 'larry.a.montgomery@gmail.com';
            if (isAdmin) {
              if (data.role !== 'admin' || data.status !== 'active') {
                data = { ...data, role: 'admin', status: 'active' };
                await setDoc(doc(db, 'users', firebaseUser.uid), data, { merge: true });
              }
            } else {
              // Revert this user to user role if they were bootstrapped as admin previously
              if (data.role === 'admin' && firebaseUser.email === 'admin@gaprimarycare.com') {
                data.role = 'user';
                await setDoc(doc(db, 'users', firebaseUser.uid), { role: 'user' }, { merge: true });
              }
            }

            // Self-healing: if subscriptionStatus is not 'active' and they don't have a trialEndDate, or if they are the admin@gaprimarycare.com test account and need a refreshed trial to test
            const isTestUser = firebaseUser.email === 'admin@gaprimarycare.com';
            const hasTrialDate = !!data.trialEndDate;
            const trialEnd = hasTrialDate ? toDate(data.trialEndDate) : null;
            const isTrialExpired = trialEnd ? trialEnd < new Date() : false;

            if (data.role !== 'admin' && (
              !hasTrialDate || 
              (isTestUser && isTrialExpired) // Automatically resets trial for this test user so they can view the trial counter!
            )) {
              const trialStarts = new Date();
              const trialEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
              data.subscriptionStatus = 'trialing';
              data.accountStatus = 'trial';
              data.trialStartDate = trialStarts as any;
              data.trialEndDate = trialEnds as any;
              data.paymentSuspended = false;
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                subscriptionStatus: 'trialing',
                accountStatus: 'trial',
                trialStartDate: trialStarts,
                trialEndDate: trialEnds,
                paymentSuspended: false
              }, { merge: true });
            } else {
              // Ensure existing users have standardized fields set gracefully
              let needsUpdate = false;
              const updates: any = {};
              
              if (!data.accountStatus) {
                if (data.subscriptionStatus === 'active') {
                  data.accountStatus = 'active';
                } else if (data.subscriptionStatus === 'trialing') {
                  data.accountStatus = 'trial';
                } else if (data.subscriptionStatus === 'canceled') {
                  data.accountStatus = 'canceled';
                } else {
                  data.accountStatus = 'trial';
                }
                updates.accountStatus = data.accountStatus;
                needsUpdate = true;
              }
              
              if (data.paymentSuspended === undefined) {
                data.paymentSuspended = false;
                updates.paymentSuspended = false;
                needsUpdate = true;
              }
              
              if (!data.trialStartDate) {
                const start = data.createdAt || new Date();
                data.trialStartDate = start as any;
                updates.trialStartDate = start;
                needsUpdate = true;
              }

              if (needsUpdate) {
                await setDoc(doc(db, 'users', firebaseUser.uid), updates, { merge: true });
              }
            }
            
            setUserProfile(data);
          } else {
            // First time login - create default profile
            const isAdmin = firebaseUser.email === 'larry.a.montgomery@gmail.com';
            
            const newProfile: UserProfile = {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'New User',
              photoURL: firebaseUser.photoURL || '',
              createdAt: serverTimestamp() as any,
              updatedAt: serverTimestamp() as any,
              role: isAdmin ? 'admin' : 'user',
              status: 'active', // Default to active for immediate access
              subscriptionStatus: 'trialing',
              accountStatus: 'trial',
              trialStartDate: new Date(),
              trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day free trial
              paymentSuspended: false,
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
            triggerOnboardingEmail(firebaseUser);
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
      
      // Immediately create the user document with the typed name, 
      // preventing onAuthStateChanged from initializing it as 'New User'
      const newProfile: UserProfile = {
        email: email,
        displayName: name || 'New User',
        photoURL: '',
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        role: 'user',
        status: 'active', // Default to active for immediate access
        subscriptionStatus: 'trialing',
        accountStatus: 'trial',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day free trial
        paymentSuspended: false,
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
      
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
      
      // Send Firebase Email Verification
      await firebaseSendEmailVerification(user);

      // We continue to send the custom onboarding welcome email
      triggerOnboardingEmail(user);
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

  const sendPasswordReset = async (email: string) => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset', error);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      try {
        await firebaseSendEmailVerification(auth.currentUser);
      } catch (error) {
        console.error('Error sending verification email', error);
        throw error;
      }
    } else {
      throw new Error('No user is signed in to send verification email');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signInWithGoogle, 
      signInWithEmail, 
      signUpWithEmail, 
      sendPasswordReset,
      sendVerificationEmail,
      signOut, 
      isSigningIn 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
