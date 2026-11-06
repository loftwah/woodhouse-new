import type { Story } from "../types";
import SignaturePlate from "../../components/SignaturePlate.astro";

const meta = {
  title: "Foundations/Signature plate",
  component: SignaturePlate,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The homepage signature. The still is the poster for every failure path; the canvas is the live loom. The pause control stays outside the artwork. Reduced motion keeps the same composition."
      }
    }
  }
} satisfies Record<string, unknown>;

export default meta;

export const Default: Story = {};
