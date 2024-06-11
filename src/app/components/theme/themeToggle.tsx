"use client";
import { useEffect, useState, useCallback } from "react";
import { themeEffect } from "./themeEffect";

export function ThemeToggle() {
  const [preference, setPreference] = useState<string | null>(
    localStorage.getItem("theme")
  );
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringOverride, setIsHoveringOverride] = useState(false);

  const onMediaChange = useCallback(() => {
    const current = themeEffect();
    setCurrentTheme(current);
  }, []);

  useEffect(() => {
    setPreference(localStorage.getItem("theme"));
    const current = themeEffect();
    setCurrentTheme(current);

    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
    matchMedia.addEventListener("change", onMediaChange);
    return () => matchMedia.removeEventListener("change", onMediaChange);
  }, [onMediaChange]);

  const onStorageChange = useCallback(
    (event: StorageEvent) => {
      if (event.key === "theme") setPreference(event.newValue);
    },
    [setPreference]
  );

  useEffect(() => {
    setCurrentTheme(themeEffect());
  }, [preference]);

  useEffect(() => {
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  });

  return (
    <div className="flex items-center">
      <button
        aria-label="Toggle theme"
        className={`inline-flex rounded-sm p-2 
          theme-system:!bg-inherit
          ${
            preference === "light"
              ? "[&_.sun-icon]:inline"
              : "[&_.sun-icon]:hidden"
          }
          ${
            preference === "dark"
              ? "[&_.moon-icon]:inline"
              : "[&_.moon-icon]:hidden"
          }
          ${
            preference === null
              ? "[&_.monitor-icon]:inline"
              : "[&_.monitor-icon]:hidden"
          }
        `}
        onClick={(ev) => {
          ev.preventDefault();
          setIsHoveringOverride(true);

          let newPreference: string | null =
            currentTheme === "dark" ? "light" : "dark";
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";

          if (preference !== null && systemTheme === currentTheme) {
            newPreference = null;
            localStorage.removeItem("theme");
          } else {
            localStorage.setItem("theme", newPreference);
          }

          setPreference(newPreference);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setIsHoveringOverride(false);
        }}
      >
        <span className="sun-icon">
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
        </span>
        <span className="moon-icon">
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
        </span>
        <span className="monitor-icon">
          <svg
            className="w-5 h-5 stroke-slate-400 dark:stroke-slate-300"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="14" x="2" y="3" rx="2" />
            <line x1="8" x2="16" y1="21" y2="21" />
            <line x1="12" x2="12" y1="17" y2="21" />
          </svg>
        </span>
      </button>
    </div>
  );
}
