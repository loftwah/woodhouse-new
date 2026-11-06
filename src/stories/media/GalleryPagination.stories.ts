import type { Story } from "../types";
import GalleryPagination from "../../components/GalleryPagination.astro";

const meta = {
  title: "Media/Gallery pagination",
  component: GalleryPagination,
  parameters: { layout: "fullscreen" },
  args: {
    type: "images",
    page: 1,
    pages: 8,
    end: false
  }
} satisfies Record<string, unknown>;

export default meta;

export const FirstPage: Story = {};

export const MiddlePage: Story = {
  args: { page: 4 }
};

export const LastPage: Story = {
  args: { page: 8, end: true }
};
