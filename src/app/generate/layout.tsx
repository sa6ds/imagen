"use client";
import { useUser } from "../components/auth/useUser";
import { ReactNode } from "react";
import AuthGuard from "../components/auth/AuthGuard";
import Loading from "../loading";

export default function Layout({ children }: { children: ReactNode }) {
  const user = useUser();

  if (user === false) return <Loading />;
  if (!user) return <AuthGuard />;
  return children;
}
