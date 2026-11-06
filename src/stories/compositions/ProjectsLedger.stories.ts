import type { Story } from "../types";
import ProjectsLedger from "./ProjectsLedger.astro";

const meta = {
  title: "Compositions/Projects ledger",
  component: ProjectsLedger,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A representative full-page composition built from the production header, project rows, filter row and footer with public-safe fixtures. The route itself still reads EmDash and live source artwork."
      }
    }
  }
} satisfies Record<string, unknown>;

export default meta;

export const Default: Story = {};
