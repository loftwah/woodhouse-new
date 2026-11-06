import type { Story } from "../types";
import StatusStamp from "../../components/StatusStamp.astro";

const meta = {
  title: "Foundations/Status stamp",
  component: StatusStamp,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A labelled state. The symbol is decorative; the text always carries the meaning."
      }
    }
  },
  argTypes: {
    tone: {
      control: "select",
      options: ["quiet", "green", "amber", "red"]
    },
    label: { control: "text" },
    note: { control: "text" }
  },
  args: {
    tone: "quiet",
    label: "Replay-checked competition, rebuilt presentation."
  }
} satisfies Record<string, unknown>;

export default meta;

export const Quiet: Story = {};

export const Reporting: Story = {
  args: {
    tone: "green",
    label: "Desktop release available",
    note: "Reviewed 6 November 2026"
  }
};

export const Attention: Story = {
  args: {
    tone: "amber",
    label: "Save repair shipped, release acceptance open.",
    note: "Physical proof open"
  }
};

export const Stopped: Story = {
  args: {
    tone: "red",
    label: "Release held",
    note: "A newer analytics release is still held."
  }
};
