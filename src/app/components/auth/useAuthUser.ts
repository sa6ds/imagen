import { useState, useEffect } from "react";
import { auth, db, provider } from "@/app/Firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import User from "./User";

type CombinedUser = FirebaseUser & User;

export function useAuthUser() {
  const [user, setUser] = useState<CombinedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as User;
          setUser({ ...firebaseUser, ...userData });
        } else {
          setUser(firebaseUser as CombinedUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !user.isActive) {
      setIsBanned(true);
      alert("You are banned from using this service.");
      signOut(auth);
      setUser(null);
    }
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as User;
        setUser({ ...firebaseUser, ...userData });
      } else {
        setUser(firebaseUser as CombinedUser);
      }

      await setDoc(
        userRef,
        {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          isActive: true,
        },
        { merge: true }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return { user, signInWithGoogle, handleLogout, loading, isBanned };
}
