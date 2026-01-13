import { useRouteError } from "react-router-dom";
import ErrorFallback from "./ErrorFallback";
import * as Sentry from "@sentry/react";
import { useEffect } from "react";

const GlobalError = () => {
  const error = useRouteError();

  useEffect(() => {
    // Ensure Sentry captures this if it hasn't already
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorFallback 
      error={error} 
      resetErrorBoundary={() => window.location.reload()} 
    />
  );
};

export default GlobalError;
