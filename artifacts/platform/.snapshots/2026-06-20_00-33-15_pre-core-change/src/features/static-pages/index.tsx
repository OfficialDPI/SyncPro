/**
 * Static Pages Feature Module
 * Bundles all informational/marketing pages: Pricing, About, Terms, Privacy, Docs, 404.
 * All are standalone (no sidebar layout).
 */
import { lazy } from "react";
import type { FeaturePlugin, FeatureRoute, FeatureNavigation } from "@/core/registry/types";

const PricingPage = lazy(() => import("@/pages/pricing"));
const AboutPage = lazy(() => import("@/pages/about"));
const TermsPage = lazy(() => import("@/pages/terms"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const DocsPage = lazy(() => import("@/pages/docs"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

export const staticPagesPlugin: FeaturePlugin = {
  name: "static-pages",

  register() {
    // No side effects needed
  },

  routes(): FeatureRoute[] {
    return [
      { path: "/pricing", component: PricingPage, wrapInLayout: false },
      { path: "/about", component: AboutPage, wrapInLayout: false },
      { path: "/terms", component: TermsPage, wrapInLayout: false },
      { path: "/privacy", component: PrivacyPage, wrapInLayout: false },
      { path: "/docs", component: DocsPage, wrapInLayout: false },
      // 404 — must be last; caught by wildcard in AppRouter
      { path: "/:rest*", component: NotFoundPage, wrapInLayout: false },
    ];
  },

  navigation(): FeatureNavigation[] {
    return []; // Static pages have no primary nav entry
  },
};
