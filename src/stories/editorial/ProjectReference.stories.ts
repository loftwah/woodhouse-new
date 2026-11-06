import type { Story } from "../types";
import ProjectReferenceBlock from "../../components/blocks/ProjectReferenceBlock.astro";

const meta = {
  title: "Editorial/Project reference",
  component: ProjectReferenceBlock,
  parameters: { layout: "padded" },
  args: {
    value: { project_key: "bubbles", label: "Bubbles" }
  }
} satisfies Record<string, unknown>;

export default meta;

export const Default: Story = {};
