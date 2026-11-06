import type { Story } from "../types";
import PullQuote from "../../components/blocks/PullQuote.astro";

const meta = {
  title: "Editorial/Pull quote",
  component: PullQuote,
  parameters: { layout: "fullscreen" },
  args: {
    value: {
      quote: "A useful second attempt starts with a goal a player can understand.",
      attribution: "Bubbles field note, 23 October 2026"
    }
  }
} satisfies Record<string, unknown>;

export default meta;

export const WithAttribution: Story = {};

export const WithoutAttribution: Story = {
  args: {
    value: {
      quote: "A merge is not a deployment, and a deployment is not a person using the thing."
    }
  }
};
