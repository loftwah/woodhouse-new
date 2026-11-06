import type { Story } from "../types";
import Callout from "../../components/blocks/Callout.astro";

const meta = {
  title: "Editorial/Callout",
  component: Callout,
  parameters: { layout: "padded" },
  argTypes: {
    value: { control: "object" }
  },
  args: {
    value: {
      kind: "plain",
      title: "What changed",
      body: "Fewest Shots is live as a second competitive mode on its own shot-limited run."
    }
  }
} satisfies Record<string, unknown>;

export default meta;

export const Plain: Story = {};

export const Evidence: Story = {
  args: {
    value: {
      kind: "evidence",
      title: "Evidence reviewed",
      body: "The public summary, screenshot and release note were reviewed on 19 October 2026. Private repository material is not part of this record."
    }
  }
};

export const Boundary: Story = {
  args: {
    value: {
      kind: "boundary",
      title: "What this does not prove",
      body: "A passing replay check is evidence for the replay, not for a person enjoying the game. Physical play and adoption need their own observations."
    }
  }
};
