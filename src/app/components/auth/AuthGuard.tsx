import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./useUser";

export default function AuthGuard() {
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [router, user]);

  return null;
}
