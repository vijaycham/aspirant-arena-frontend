import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { store, persistor } from "./redux/store.js";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { SpeedInsights } from "@vercel/speed-insights/react";

import * as Sentry from "@sentry/react";
import ErrorFallback from "./components/ErrorFallback";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, 
  // Session Replay
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE, // 👈 Fix: Dynamically set environment (development/production)
});

import GlobalError from "./components/GlobalError";

const router = createBrowserRouter([
  { 
    path: "/*", 
    element: <App />, // All routes are handled here 
    errorElement: <GlobalError />
  }, 
]);

const root = createRoot(document.getElementById("root"));
root.render(
  <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <RouterProvider router={router} />
        <SpeedInsights />
      </PersistGate>
    </Provider>
  </Sentry.ErrorBoundary>
);
