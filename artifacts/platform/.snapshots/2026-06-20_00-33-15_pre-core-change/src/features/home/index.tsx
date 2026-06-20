/**
 * Home Feature Module
 * Re-exports the existing page component under the feature plugin contract.
 */
import { lazy } from "react";
import type { FeaturePlugin, FeatureRoute, FeatureNavigation } from "@/core/registry/types";

const HomePage = lazy(() => import("@/pages/home"));

export const homePlugin: FeaturePlugin = {
  name: "home",

  register() {
    // No side effects needed for home
  },

  routes(): FeatureRoute[] {
    return [
      {
        path: "/",
        component: HomePage,
        wrapInLayout: true,
      },
    ];
  },

  navigation(): FeatureNavigation[] {
    return [
      {
        label: "Home",
        path: "/",
        icon: "Home",
        position: "sidebar",
      },
    ];
  },
};
