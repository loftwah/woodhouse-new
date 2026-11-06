import type { Story } from "../types";
import EditionShareAssets from "../../components/EditionShareAssets.astro";
import { editionShareAssets } from "../../data/edition-share-kit";

const meta = {
  title: "Editions/Edition share assets",
  component: EditionShareAssets,
  parameters: { layout: "padded" },
  args: {
    assets: editionShareAssets.slice(0, 3)
  }
} satisfies Record<string, unknown>;

export default meta;

export const Images: Story = {
  args: {
    assets: editionShareAssets.filter((asset) => asset.kind === "image").slice(0, 3)
  }
};
