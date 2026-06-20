/**
 * @protected CORE ENGINE - Do not modify without approval
 * AppRouter dynamically maps all feature plugin routes into a single Switch tree.
 * Features register their routes via the featureRegistry; this file just wires them up.
 */
import { Suspense } from "react";
import { Switch, Route } from "wouter";
import Layout from "@/components/layout";
import { featureRegistry } from "@/core/registry/feature-registry";

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground">Loading…</span>
      </div>
    </div>
  );
}

export default function AppRouter() {
  const allRoutes = featureRegistry.flatMap((f) => f.routes());
  const layoutRoutes = allRoutes.filter((r) => r.wrapInLayout);
  const standaloneRoutes = allRoutes.filter((r) => !r.wrapInLayout);

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Standalone routes — full-screen, no sidebar */}
        {standaloneRoutes.map((route) => (
          <Route key={route.path} path={route.path} component={route.component} />
        ))}

        {/* Layout-wrapped routes — with sidebar + header */}
        <Route>
          <Layout>
            <Switch>
              {layoutRoutes.map((route) => (
                <Route key={route.path} path={route.path} component={route.component} />
              ))}
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </Suspense>
  );
}
