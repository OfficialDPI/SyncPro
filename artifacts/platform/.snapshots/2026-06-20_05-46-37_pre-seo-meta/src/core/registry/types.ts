import React from 'react';

export interface FeatureRoute {
  path: string;
  component: React.ComponentType<any>;
  wrapInLayout?: boolean; // Whether to wrap in global Layout (sidebar/header)
}

export interface FeatureNavigation {
  label: string;
  path: string;
  icon: string; // Lucide icon name string
  position: 'sidebar' | 'settings' | 'footer';
}

export interface FeaturePlugin {
  name: string;
  register(): void;
  routes(): FeatureRoute[];
  navigation(): FeatureNavigation[];
  permissions?(): string[];
}
