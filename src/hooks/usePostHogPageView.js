import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import posthog from "posthog-js";

const usePostHogPageView = () => {
    const location = useLocation();

    useEffect(() => {
        posthog.capture("$pageview", {
            path: location.pathname + location.search,
        });
    }, [location]);
};

export default usePostHogPageView;
