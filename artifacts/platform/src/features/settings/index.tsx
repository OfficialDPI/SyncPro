/**
 * Settings Feature Module
 * Routes /settings as a standalone full-screen page (no sidebar layout).
 */
import { lazy } from "react";
import type { FeaturePlugin, FeatureRoute, FeatureNavigation } from "@/core/registry/types";

const SettingsPage = lazy(() => import("@/pages/settings"));

export const settingsPlugin: FeaturePlugin = {
  name: "settings",

  register() {
    // No side effects needed for settings
  },

  routes(): FeatureRoute[] {
    return [
      {
        path: "/settings",
        component: SettingsPage,
        wrapInLayout: false, // Has its own internal layout
      },
    ];
  },

  navigation(): FeatureNavigation[] {
    return [
      {
        label: "Settings",
        path: "/settings",
        icon: "Settings",
        position: "footer",
      },
    ];
  },
};
