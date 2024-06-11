import { useEffect, useState } from "react";
import { auth } from "@/app/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/Firebase";
import type { User as FirebaseAuthUser } from "firebase/auth";
import type User from "./User";

type CombinedUser = FirebaseAuthUser & User;

export function useUser() {
  const [user, setUser] = useState<CombinedUser | null | false>(false);

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
    });

    return () => unsubscribe();
  }, []);

  return user;
}
