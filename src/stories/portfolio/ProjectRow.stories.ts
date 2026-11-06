import type { Story } from "../types";
import ProjectRow from "../../components/ProjectRow.astro";
import { bubbles, fighter, shoalshot } from "../fixtures";

const meta = {
  title: "Portfolio/Project row",
  component: ProjectRow,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "One open ledger row, separated by rules rather than a card. Production passes the recorded project and resolves live artwork at render; the workshop passes the already-resolved artwork so the story is deterministic."
      }
    }
  },
  argTypes: {
    headingLevel: { control: "select", options: ["h2", "h3"] },
    compact: { control: "boolean" },
    eager: { control: "boolean" }
  },
  args: {
    project: bubbles,
    artwork: bubbles,
    headingLevel: "h3",
    compact: false,
    eager: true
  }
} satisfies Record<string, unknown>;

export default meta;

export const Bubbles: Story = {};

export const Fighter: Story = {
  args: { project: fighter, artwork: fighter }
};

export const SHOALSHOT: Story = {
  args: { project: shoalshot, artwork: shoalshot }
};

export const Compact: Story = {
  args: { compact: true, eager: false }
};

/** Stress a long product name and hook; this is a layout test, not a project claim. */
export const LongTitleStress: Story = {
  args: {
    project: {
      ...bubbles,
      name: "The Extremely Long Product Name That Has To Wrap",
      title:
        "A long hook that keeps going so the row has to hold its hierarchy when the words outnumber the space available.",
      state:
        "A long state label that also has to remain readable without pushing the review date away."
    },
    artwork: {
      ...bubbles,
      name: "The Extremely Long Product Name That Has To Wrap",
      title:
        "A long hook that keeps going so the row has to hold its hierarchy when the words outnumber the space available.",
      state:
        "A long state label that also has to remain readable without pushing the review date away."
    }
  }
};
