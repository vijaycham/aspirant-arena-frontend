import { useEffect } from "react";

const useClarity = () => {
    useEffect(() => {
        const clarityId = import.meta.env.VITE_CLARITY_ID;

        if (!clarityId) {
            console.warn("Microsoft Clarity ID not found (VITE_CLARITY_ID). analytics skipped.");
            return;
        }

        // Prevent duplicate injection
        if (document.querySelector('script[src*="clarity.ms"]')) return;

        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", clarityId);

    }, []);
};

export default useClarity;
