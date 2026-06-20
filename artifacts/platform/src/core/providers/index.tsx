/**
 * @protected CORE ENGINE — src/core/providers/index.tsx
 * Composes all global React context providers in the correct order.
 * Do NOT add providers in App.tsx — add them here with approval.
 * Do not modify without approval.
 */
import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/lib/settings-context";
import { AuthProvider } from "@/core/auth";
import { logger } from "@/core/observability/logger";
import { BUILD_INFO } from "@/core/runtime";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function PlatformBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    logger.info("Platform", `${BUILD_INFO.name} v${BUILD_INFO.version} initialized`, {
      env: BUILD_INFO.env,
      buildTime: BUILD_INFO.buildTime,
    });
  }, []);
  return <>{children}</>;
}

export default function CoreProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AuthProvider>
          <TooltipProvider>
            <PlatformBootstrap>
              {children}
            </PlatformBootstrap>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
