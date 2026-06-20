/**
 * @protected CORE ENGINE - Do not modify without approval
 * App.tsx is the top-level entry point. It mounts providers and the dynamic router.
 * All routes and features are registered via the featureRegistry — do not add routes here.
 */
import { useEffect } from "react";
import { Router as WouterRouter } from "wouter";
import CoreProviders from "@/core/providers";
import AppRouter from "@/core/router";

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <CoreProviders>
        <AppRouter />
      </CoreProviders>
    </WouterRouter>
  );
}

export default App;
