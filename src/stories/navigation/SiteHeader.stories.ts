import type { Story } from "../types";
import SiteHeader from "../../components/SiteHeader.astro";
import BrandMark from "../../components/BrandMark.astro";
import SiteSearch from "../../components/SiteSearch.astro";
import { houseIndexNavigation, primaryNavigation } from "../fixtures";

const meta = {
  title: "Navigation/Site header",
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The production header. The desktop nav and phone Menu share one normalised destination list; search is a dialog triggered from either the header or ⌘K."
      }
    }
  },
  args: {
    currentPath: "/projects/",
    links: primaryNavigation,
    houseIndexLinks: houseIndexNavigation,
    slots: {
      brand: BrandMark,
      default: { component: SiteSearch, props: {} }
    }
  }
} satisfies Record<string, unknown>;

export default meta;

export const Desktop: Story = {};

export const OnTheHomepage: Story = {
  args: { currentPath: "/" }
};

export const OnAnalytics: Story = {
  args: { currentPath: "/activity/" }
};

export const Phone: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" }
  },
  globals: { viewport: { value: "mobile1" } }
};
