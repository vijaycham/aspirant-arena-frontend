import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const ThemeToggle = () => {
  // 1. Initialize state from LocalStorage (or default to light)
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  // 2. Effect: Whenever 'theme' changes, update the DOM and LocalStorage
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 3. Toggle Handler
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-full transition-transform duration-200 shadow-md
        ${theme === "dark" 
          ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" 
          : "bg-white text-orange-500 hover:bg-orange-50"
        }
        hover:scale-110 active:scale-95
      `}
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? <FaMoon /> : <FaSun />}
    </button>
  );
};

export default ThemeToggle;
