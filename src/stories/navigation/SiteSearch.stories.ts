import type { Story } from "../types";
import SiteSearch from "../../components/SiteSearch.astro";

const meta = {
  title: "Navigation/Site search",
  component: SiteSearch,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Open the header search control or press ⌘K / Ctrl+K. Results are a static projection of the published record; the dialog and keyboard handling are real."
      }
    }
  },
  args: {
    pages: [
      {
        title: "Bubbles",
        description: "The classic bubble shooter, in your browser.",
        href: "/projects/bubbles/",
        section: "Projects"
      },
      {
        title: "Bubbles: a better second attempt",
        description:
          "One board, no shot limit. Fewest Shots gives the familiar bubble shooter a different reason to try again.",
        href: "/dispatches/a-better-second-attempt/",
        section: "Stories"
      },
      {
        title: "Share desk",
        description: "Images, films and ready captions for every published project.",
        href: "/share/",
        section: "Share"
      }
    ]
  }
} satisfies Record<string, unknown>;

export default meta;

export const Closed: Story = {};

export const WithPublishedResults: Story = {};
