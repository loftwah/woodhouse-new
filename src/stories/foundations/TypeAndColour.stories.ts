import type { Story } from "../types";
import TypeAndColour from "./TypeAndColour.astro";

const meta = {
  title: "Foundations/Type and colour",
  component: TypeAndColour,
  parameters: {
    docs: {
      description: {
        component:
          "The real token values from src/styles/global.css. This sheet is documentation, not a production component."
      }
    }
  }
} satisfies Record<string, unknown>;

export default meta;

export const Default: Story = {};
