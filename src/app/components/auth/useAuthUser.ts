import { useState, useEffect } from "react";
import { auth, db, provider } from "@/app/Firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
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
        await fetchUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data() as User;
      if (!userData.isActive) {
        alert(
          "Your account has been deactivated. Contact us for more information."
        );
        await signOut(auth);
        return;
      }
      setUser({ ...firebaseUser, ...userData });
    } else {
      // New user, initialize with empty arrays and zero strike count
      const newUserData: User = {
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        isActive: true,
        prompts: [],
        rejectedPrompts: [],
        strikeCount: 0,
      };
      await setDoc(userRef, newUserData);
      setUser({ ...firebaseUser, ...newUserData } as CombinedUser);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await fetchUserData(result.user);
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

  const logRejectedPrompt = async (prompt: string) => {
    if (!user) return true;

    const now = new Date();
    const formattedTime = formatTime(now);

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as User;

    let rejectedPrompts = userData.rejectedPrompts || [];
    rejectedPrompts = [
      ...rejectedPrompts,
      { prompt, timestamp: formattedTime },
    ];

    let isActive = userData.isActive !== false;
    let strikeCount = userData.strikeCount || 0;

    // Increment strike count and check if user should be banned
    strikeCount++;
    if (strikeCount >= 3) {
      isActive = false;
    }

    await updateDoc(userRef, {
      rejectedPrompts,
      lastRejectedPromptAt: serverTimestamp(),
      strikeCount,
      isActive,
    });

    // Log to a separate collection for admin review
    const rejectedPromptsRef = doc(db, "rejectedPrompts", now.toISOString());
    await setDoc(rejectedPromptsRef, {
      prompt,
      userId: user.uid,
      timestamp: serverTimestamp(),
      formattedTimestamp: formattedTime,
    });

    // Update local user state
    setUser((prevUser) =>
      prevUser ? { ...prevUser, isActive, strikeCount } : null
    );

    // If the user is now banned, return false
    return isActive;
  };

  const logAcceptedPrompt = async (prompt: string) => {
    if (!user) return;

    const now = new Date();
    const formattedTime = formatTime(now);
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      prompts: arrayUnion({
        prompt,
        timestamp: formattedTime,
      }),
      lastPromptAt: serverTimestamp(),
    });
  };

  return {
    user,
    signInWithGoogle,
    handleLogout,
    loading,
    logRejectedPrompt,
    logAcceptedPrompt,
  };
}

function formatTime(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
