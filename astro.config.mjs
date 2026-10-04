import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import react from "@astrojs/react";
import { fileURLToPath } from "node:url";
import { d1, kvCache, r2, sandbox } from "@emdash-cms/cloudflare";
import auditLog from "@emdash-cms/plugin-audit-log";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { buildIdentityIntegration } from "./scripts/build-identity.mjs";

const siteOrigin =
  process.env.WOODHOUSE_SITE_URL ??
  (process.env.CLOUDFLARE_ENV === "preview"
    ? "https://woodhouse-loftwah-preview.loftwah.workers.dev"
    : "https://woodhouse.loftwah.com");

function resendEmail() {
  return {
    id: "woodhouse-resend-email",
    version: "1.0.0",
    entrypoint: fileURLToPath(new URL("./src/plugins/resend-email.ts", import.meta.url)),
    format: "native",
    options: { from: "woodhouse@loftwah.com" },
    capabilities: ["hooks.email-transport:register"]
  };
}

function woodhousePlugin(id, capabilities, extra = {}) {
  const { admin, ...descriptor } = extra;
  return {
    id,
    version: "1.0.0",
    entrypoint: fileURLToPath(new URL(`./.emdash/build/plugins/${id}.mjs`, import.meta.url)),
    format: "standard",
    capabilities,
    ...descriptor,
    ...(admin?.pages ? { adminPages: admin.pages } : {}),
    ...(admin?.widgets ? { adminWidgets: admin.widgets } : {}),
    ...(admin?.settingsSchema ? { settingsSchema: admin.settingsSchema } : {})
  };
}

const editorialPolicy = woodhousePlugin(
  "woodhouse-editorial-policy",
  ["hooks.content-policy:register"],
  { hooks: ["content:beforePublish", "content:beforeSchedule"] }
);
const enquiries = woodhousePlugin("woodhouse-enquiries", ["email:send"], {
  storage: { submissions: { indexes: ["createdAt", "status"] } },
  admin: {
    pages: [{ path: "/submissions", label: "Enquiries", icon: "inbox" }],
    settingsSchema: {
      notificationAddress: {
        type: "secret",
        label: "Private notification recipient",
        description: "Optional Woodhouse-only address for enquiry notifications."
      }
    }
  },
  routes: [
    {
      name: "submit",
      public: true,
      methods: ["POST"],
      request: { body: "form-data", maxBytes: 8192 },
      response: "raw"
    },
    {
      name: "admin",
      permission: "plugins:manage",
      methods: ["POST"],
      request: { body: "json", maxBytes: 4096 }
    }
  ],
  hooks: ["plugin:activate", "cron"]
});

export default defineConfig({
  site: siteOrigin,
  output: "server",
  adapter: cloudflare(),
  cache: { provider: cacheCloudflare() },
  routeRules: {
    "/": { maxAge: 60, swr: 60, tags: ["woodhouse-public"] },
    "/factory/": { maxAge: 60, swr: 60, tags: ["woodhouse-factory"] },
    "/projects/": { maxAge: 60, swr: 60, tags: ["woodhouse-projects"] },
    "/projects/[slug]/": { maxAge: 60, swr: 60, tags: ["woodhouse-projects"] },
    "/dispatches/": { maxAge: 60, swr: 60, tags: ["woodhouse-dispatches"] },
    "/dispatches/[slug]/": { maxAge: 60, swr: 60, tags: ["woodhouse-dispatches"] },
    "/evidence/[slug]/": { maxAge: 60, swr: 60, tags: ["woodhouse-evidence"] },
    "/incidents/[slug]/": { maxAge: 60, swr: 60, tags: ["woodhouse-incidents"] },
    "/agents/facts.json": { maxAge: 60, swr: 60, tags: ["woodhouse-facts"] },
    "/build.json": { maxAge: 60, swr: 60, tags: ["woodhouse-build"] },
    "/rss.xml": { maxAge: 60, swr: 60, tags: ["woodhouse-dispatches"] },
    "/sitemap.xml": { maxAge: 60, swr: 60, tags: ["woodhouse-public"] }
  },
  integrations: [
    buildIdentityIntegration(),
    react(),
    emdash({
      database: d1({ binding: "DB", session: "disabled" }),
      storage: r2({ binding: "MEDIA" }),
      objectCache: kvCache({ binding: "CACHE", defaultTtl: 300, keyPrefix: "woodhouse:emdash:" }),
      siteUrl: siteOrigin,
      sandboxed: [auditLog, editorialPolicy, enquiries],
      sandboxRunner: sandbox(),
      toolbar: "client",
      maxUploadSize: 10 * 1024 * 1024,
      plugins: [resendEmail()],
      updateCheck: { minimumReleaseAge: "48h" }
    })
  ],
  build: {
    format: "directory",
    compressHTML: true
  },
  vite: {
    build: {
      cssMinify: true
    }
  }
});
