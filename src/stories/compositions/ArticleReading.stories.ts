import type { Story } from "../types";
import ArticleReading from "./ArticleReading.astro";

const meta = {
  title: "Compositions/Article reading",
  component: ArticleReading,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A representative long-form reading composition with the production header, editorial blocks, evidence rail and footer."
      }
    }
  }
} satisfies Record<string, unknown>;

export default meta;

export const Default: Story = {};
