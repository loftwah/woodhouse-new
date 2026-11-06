import type { Story } from "../types";
import ShowcaseGallery from "../../components/ShowcaseGallery.astro";
import { campaignItems } from "../../data/showcase-campaign";

const meta = {
  title: "Media/Showcase gallery",
  component: ShowcaseGallery,
  parameters: { layout: "fullscreen" },
  args: {
    items: campaignItems.slice(0, 4)
  }
} satisfies Record<string, unknown>;

export default meta;

export const FourItems: Story = {};

export const SingleItem: Story = {
  args: { items: campaignItems.slice(0, 1) }
};

export const TwoItems: Story = {
  args: { items: campaignItems.slice(0, 2) }
};
