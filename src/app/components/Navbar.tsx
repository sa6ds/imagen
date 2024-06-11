"use client";

import { useAuthUser } from "./auth/useAuthUser";
import Image from "next/image";
import Link from "next/link";
import Logo from "../assets/ImagenLogo.svg";
import { ThemeToggle } from "./theme/themeToggle";

function Navbar() {
  const { user, signInWithGoogle, handleLogout } = useAuthUser();

  return (
    <div className="container mx-auto px-12 py-12">
      <header className="flex w-full">
        <div className="flex flex-row items-center">
          <Link href="/">
            <Image
              src={Logo}
              draggable="false"
              width={28}
              height={28}
              alt="Imagen Logo"
            ></Image>
          </Link>
          <h1 className="dark:text-white text-slate-900 px-4 font-bold tracking-tighter text-xl my-auto ">
            Imagen.lol
          </h1>
        </div>
        <div className="flex my-auto ml-auto gap-2 md:gap-4">
          <button
            onClick={user ? handleLogout : signInWithGoogle}
            className="dark:text-white text-slate-500 hover:text-orange-500 dark:hover:text-orange-500 px-3 py-1.5 hover:rounded-xl"
          >
            {user ? "Logout" : "Login"}
          </button>
          <ThemeToggle />
        </div>
      </header>
    </div>
  );
}

export default Navbar;
