import Image from "next/image";
import Link from "next/link";
import Logo from "../assets/ImagenLogo.svg";
import React, { useEffect, useState } from "react";

function Navbar() {
  const [theme, setTheme] = useState<"dark" | "light" | null>(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme === "dark" ? "dark" : "light";
  });

  localStorage.getItem("mode");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme || "");
  }, [theme]);

  const handleThemeSwitch = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    console.log("HandleThemeSwitch");
  };

  return (
    <div>
      {/* NAVBAR */}
      <div className="flex w-full">
        {/* Pic and Logo */}
        <div className="flex flex-row items-center space-x-3">
          <Link href="/">
            <Image
              src={Logo}
              draggable="false"
              width={28}
              height={28}
              alt="Imagen Logo"
            ></Image>
          </Link>
          <h1 className="dark:text-white font-bold tracking-tighter text-xl my-auto ">
            Imagen.lol
          </h1>
        </div>
        <div className="my-auto ml-auto">
          <button onClick={handleThemeSwitch}>
            {theme === "dark" ? (
              <svg
                className="w-5 h-5 stroke-slate-400 dark:stroke-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-5 h-5 stroke-slate-400 dark:stroke-slate-300"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
