import type { Story } from "../types";
import BrandMark from "../../components/BrandMark.astro";

const meta = {
  title: "Foundations/Brand mark",
  component: BrandMark,
  parameters: { layout: "fullscreen" }
} satisfies Record<string, unknown>;

export default meta;

export const Default: Story = {};
