import { FeaturePlugin } from './types';
import { homePlugin } from '@/features/home';
import { chatPlugin } from '@/features/chat';
import { projectsPlugin } from '@/features/projects';
import { settingsPlugin } from '@/features/settings';
import { staticPagesPlugin } from '@/features/static-pages';

export const featureRegistry: FeaturePlugin[] = [
  homePlugin,
  chatPlugin,
  projectsPlugin,
  settingsPlugin,
  staticPagesPlugin,
];

// Initialize and register all active plugins
export function registerAllFeatures() {
  featureRegistry.forEach(feature => {
    try {
      feature.register();
    } catch (e) {
      console.error(`Failed to register feature "${feature.name}":`, e);
    }
  });
}
