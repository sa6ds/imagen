import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/"); // Redirect to the homepage
  }, []);
}
