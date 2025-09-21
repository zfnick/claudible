import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { AuthProvider } from "@/contexts/AuthContext";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import SimpleLogin from "@/pages/SimpleLogin.tsx";
import ProviderSelect from "@/pages/ProviderSelect.tsx";
import BeforeStart from "@/pages/BeforeStart.tsx";
import Summary from "./pages/Summary.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import "./types/global.d.ts";



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <AuthProvider>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<SimpleLogin />} />
            <Route path="/providers" element={<ProviderSelect />} />
            <Route path="/before-start/:provider" element={<BeforeStart />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth" element={<AuthPage redirectAfterAuth="/" />} /> {/* TODO: change redirect after auth to correct page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);