import type { Story } from "../types";
import ShareActions from "../../components/ShareActions.astro";
import { campaignItems } from "../../data/showcase-campaign";

const item = campaignItems.find((entry) => entry.id === "bubbles-one-more-shot")!;

const meta = {
  title: "Media/Share actions",
  component: ShareActions,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Copy prepares a post; it never posts. Pending and settled labels are real client states, and a failed copy keeps the download available."
      }
    }
  },
  args: {
    caption: item.caption,
    image: item.image,
    filename: "bubbles-one-more-shot.jpg",
    link: item.href,
    label: "Copy post"
  }
} satisfies Record<string, unknown>;

export default meta;

export const Image: Story = {};

export const WithFallback: Story = {
  args: {
    image: "/campaign/20261025-missing/bubbles.jpg",
    fallbackImage: "/campaign/20261026-previews/bubbles-one-more-shot.jpg"
  }
};
