import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const useGA = () => {
    const location = useLocation();

    // 1. Initialize GA once
    useEffect(() => {
        const gaId = import.meta.env.VITE_GA_ID;
        if (gaId) {
            ReactGA.initialize(gaId);
        } else {
            console.warn("GA4 Measurement ID missing (VITE_GA_ID). Analytics disabled.");
        }
    }, []);

    // 2. Track Page Views on route change
    useEffect(() => {
        if (import.meta.env.VITE_GA_ID) {
            ReactGA.send({ hitType: "pageview", page: location.pathname + location.search, title: document.title, });
        }
    }, [location]);
};

export default useGA;
