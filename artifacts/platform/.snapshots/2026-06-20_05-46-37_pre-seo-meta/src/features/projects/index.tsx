/**
 * Projects Feature Module
 * Registers /projects and /projects/:id under the sidebar layout.
 */
import { lazy } from "react";
import type { FeaturePlugin, FeatureRoute, FeatureNavigation } from "@/core/registry/types";

const ProjectsPage = lazy(() => import("@/pages/projects"));
const ProjectDetailPage = lazy(() => import("@/pages/project-detail"));

export const projectsPlugin: FeaturePlugin = {
  name: "projects",

  register() {
    // No side effects needed for projects
  },

  routes(): FeatureRoute[] {
    return [
      {
        path: "/projects",
        component: ProjectsPage,
        wrapInLayout: true,
      },
      {
        path: "/projects/:id",
        component: ProjectDetailPage,
        wrapInLayout: true,
      },
    ];
  },

  navigation(): FeatureNavigation[] {
    return [
      {
        label: "Projects",
        path: "/projects",
        icon: "FolderOpen",
        position: "sidebar",
      },
    ];
  },
};
