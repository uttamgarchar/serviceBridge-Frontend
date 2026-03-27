import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("sb_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("sb_theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem("sb_theme");
    if (saved === "dark") {
      setDark(true);
    }
  }, []);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <Icon icon={dark ? "solar:sun-bold" : "solar:moon-bold"} className="h-5 w-5" />
    </button>
  );
};

export default ThemeToggle;
