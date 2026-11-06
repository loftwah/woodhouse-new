import type { Story } from "../types";
import SiteFooter from "../../components/SiteFooter.astro";
import { primaryNavigation } from "../fixtures";

const meta = {
  title: "Navigation/Site footer",
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
  args: {
    reviewDateLabel: "6 November 2026",
    links: primaryNavigation
  }
} satisfies Record<string, unknown>;

export default meta;

export const Default: Story = {};

export const WithoutAReviewDate: Story = {
  args: { reviewDateLabel: undefined }
};
