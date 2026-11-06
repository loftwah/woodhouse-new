import "../src/styles/global.css";
import "./preview.css";

import type { Preview } from "@storybook-astro/framework";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "Woodhouse ink",
      values: [
        { name: "Woodhouse ink", value: "#080d19" },
        { name: "Raised surface", value: "#111a2c" }
      ]
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    options: {
      storySort: {
        order: [
          "Foundations",
          "Navigation",
          "Portfolio",
          "Editorial",
          "Analytics",
          "Media",
          "Exhibits",
          "Editions",
          "Compositions"
        ]
      }
    }
  }
};

export default preview;
