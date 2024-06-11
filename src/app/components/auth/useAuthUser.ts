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
import { useRouter } from "next/navigation";

type CombinedUser = FirebaseUser & User;

export function useAuthUser() {
  const [user, setUser] = useState<CombinedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as User;
          if (!userData.isActive) {
            alert(
              "Your account has been deactivated. Contact us for more information."
            );
            await signOut(auth);
            return; // Return early if user is banned
          }
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

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as User;
        if (!userData.isActive) {
          alert(
            "Your account has been deactivated. Contact us for more information."
          );
          await signOut(auth);
          return; // Return early if user is banned
        }
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

      setUser({ ...firebaseUser, isActive: true } as CombinedUser);
      router.push("/generate");
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

  return { user, signInWithGoogle, handleLogout, loading };
}
