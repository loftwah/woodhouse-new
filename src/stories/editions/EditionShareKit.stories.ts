import type { Story } from "../types";
import EditionShareKit from "../../components/EditionShareKit.astro";

const meta = {
  title: "Editions/Edition share kit",
  component: EditionShareKit,
  parameters: { layout: "fullscreen" },
  args: { compact: false, availablePack: true }
} satisfies Record<string, unknown>;

export default meta;

export const Full: Story = {};

export const Compact: Story = {
  args: { compact: true }
};

export const PackUnavailable: Story = {
  args: { availablePack: false }
};
