import { initWasm } from "@resvg/resvg-wasm";
import wasm from "../assets/resvg.wasm";
// Both public PNG routes share the library's single WASM instance. Independent
// route promises caused the second route to fail with "Already initialized".
let initialized: Promise<void> | undefined;
export function ensureReportRenderer() {
  initialized ??= initWasm(wasm);
  return initialized;
}
