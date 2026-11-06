import type { StorybookConfig } from "@storybook-astro/framework";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: {
    name: "@storybook-astro/framework",
    options: {}
  },
  staticDirs: ["../public"],
  docs: { autodocs: false },
  typescript: { check: false }
};

export default config;
