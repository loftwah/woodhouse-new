import type { Story } from "../types";
import GameMedia from "../../components/GameMedia.astro";
import { gameMedia } from "../../data/share-desk";

const image = gameMedia.find((asset) => asset.kind === "image")!;

const meta = {
  title: "Media/Game media",
  component: GameMedia,
  parameters: { layout: "fullscreen" },
  args: {
    asset: image,
    destination: "/share/?project=bubbles",
    eager: true
  }
} satisfies Record<string, unknown>;

export default meta;

export const ImageAsset: Story = {};
