import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebaseConfig';
import type { UserProfile } from '../types';

export interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    authModalOpen: boolean;
    setAuthModalOpen: (open: boolean) => void;
    signInWithGoogle: () => Promise<void>;
    signOutUser: () => Promise<void>;
    updateUserProfile: (data: Partial<Omit<UserProfile, 'id'>>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setFirebaseUser(user);
            if (!user) {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (firebaseUser) {
            setLoading(true);
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setUser({ id: doc.id, ...doc.data() } as UserProfile);
                } else {
                    setUser(null);
                }
                setLoading(false);
            }, (error) => {
                console.error("Error fetching user profile:", error);
                setUser(null);
                setLoading(false);
            });
            return () => unsubscribeFirestore();
        }
    }, [firebaseUser]);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            setAuthModalOpen(false); // Close modal on successful sign-in
        } catch (error) {
            console.error("Error during Google sign-in:", error);
        }
    };

    const signOutUser = async () => {
        try {
            await signOut(auth);
            window.location.hash = '#/'; // Redirect to landing page on sign out
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const updateUserProfile = async (data: Partial<Omit<UserProfile, 'id'>>) => {
        if (firebaseUser) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            try {
                await updateDoc(userDocRef, data);
            } catch (error) {
                console.error("Error updating user profile:", error);
            }
        }
    };

    const value = {
        user,
        loading,
        authModalOpen,
        setAuthModalOpen,
        signInWithGoogle,
        signOutUser,
        updateUserProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};