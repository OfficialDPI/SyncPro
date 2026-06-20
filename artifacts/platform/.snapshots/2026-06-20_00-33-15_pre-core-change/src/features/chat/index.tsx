/**
 * Chat Feature Module
 * Routes the /chat/:id workspace page as a standalone (no sidebar layout).
 */
import { lazy } from "react";
import type { FeaturePlugin, FeatureRoute, FeatureNavigation } from "@/core/registry/types";

const ChatPage = lazy(() => import("@/pages/chat"));

export const chatPlugin: FeaturePlugin = {
  name: "chat",

  register() {
    // No side effects needed for chat
  },

  routes(): FeatureRoute[] {
    return [
      {
        path: "/chat/:id",
        component: ChatPage,
        wrapInLayout: false, // Full-screen workspace
      },
    ];
  },

  navigation(): FeatureNavigation[] {
    return []; // Chat is not in the sidebar nav directly
  },
};
