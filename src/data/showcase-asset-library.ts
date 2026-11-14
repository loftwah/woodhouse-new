import type { CampaignItem } from "./showcase-campaign.ts";
import entries from "./showcase-asset-library.json" with { type: "json" };

export const assetLibrary = entries as CampaignItem[];
