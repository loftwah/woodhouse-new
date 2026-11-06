import type { Story } from "../types";
import EvidenceLinkBlock from "../../components/blocks/EvidenceLinkBlock.astro";

const meta = {
  title: "Editorial/Evidence link",
  component: EvidenceLinkBlock,
  parameters: { layout: "padded" },
  args: {
    value: {
      evidence_key: "bubbles-replay-check",
      context:
        "The replay check is the evidence behind the competition claim. Read the record before treating a score as verified.",
      label: "Read the replay-check record"
    }
  }
} satisfies Record<string, unknown>;

export default meta;

export const Default: Story = {};
