/**
 * The published Here / there contract, and the rule a composed presentation
 * follows from it.
 *
 * The contract is a list of approved contributions. A contribution that is not
 * public produces no composed card, because the composition reads the contract
 * rather than keeping a copy. These are the two rules the source-plate exhibit
 * demonstrates, written down so they can be tested.
 */

export type ContractItem = {
  id: string;
  title: string;
  description: string;
  visibility: string;
  url: string;
  image: string;
  revision: number | null;
};

export type Contract = {
  contract: number;
  provider: string;
  items: ContractItem[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

/** Keep only the published shape. A record without an address is unusable. */
const isContractItem = (value: unknown): value is Record<string, unknown> => {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.url === "string" &&
    typeof value.image === "string" &&
    typeof value.visibility === "string"
  );
};

/**
 * Read a contract payload. Returns null when the payload is not a contract, so
 * a caller can fall back rather than publish an empty list as if it were real.
 */
export const normaliseContract = (body: unknown): Contract | null => {
  if (!isRecord(body)) return null;
  const rawItems = Array.isArray(body.items) ? body.items : null;
  if (!rawItems) return null;
  const items: ContractItem[] = rawItems.filter(isContractItem).map((item) => ({
    id: item.id as string,
    title: item.title as string,
    description: typeof item.description === "string" ? item.description : "",
    visibility: item.visibility as string,
    url: item.url as string,
    image: item.image as string,
    revision: typeof item.revision === "number" ? item.revision : null
  }));
  if (!items.length) return null;
  return {
    contract: typeof body.contract === "number" ? body.contract : 1,
    provider: typeof body.provider === "string" ? body.provider : "guestbook",
    items
  };
};

/**
 * What a composed presentation shows for one contribution.
 *
 * `hidden` is the demonstration's own switch. It stands in for the provider's
 * visibility, and it never leaves this page.
 */
export const composedCard = (
  item: ContractItem | undefined,
  hidden: boolean
): { visible: boolean; reason: "ok" | "hidden" | "missing" } => {
  if (!item) return { visible: false, reason: "missing" };
  if (hidden) return { visible: false, reason: "hidden" };
  if (item.visibility !== "public") return { visible: false, reason: "hidden" };
  return { visible: true, reason: "ok" };
};

/** The wording the exhibit shows for a missing card. */
export const composedReason = (reason: "ok" | "hidden" | "missing"): string => {
  if (reason === "missing") return "No contribution is available to compose.";
  return "No card here. The source is not public, so the composition has nothing to show.";
};
